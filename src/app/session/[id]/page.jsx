"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, MessageCircle, Users, Settings, Volume2, VolumeX, Shield, Moon, Sun } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp, setDoc } from "firebase/firestore";

export default function SessionRoom({ params }) {
  const { user } = useFirebaseAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showLeaveOptions, setShowLeaveOptions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const peerConnections = useRef(new Map());
  const localStreamRef = useRef(null);
  const isAddingUserRef = useRef(false);
  const isInitializingWebRTCRef = useRef(false);

  // Get session ID from params or URL
  const sessionId = params?.id || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null);
  
  console.log("Session room loaded with sessionId:", sessionId, "params:", params);

  useEffect(() => {
    if (!user || !sessionId) return;

    // Listen to session updates
    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const sessionData = doc.data();
        console.log("Session data received:", { id: doc.id, ...sessionData });
        setSession({ ...sessionData, id: doc.id });
        setParticipants(sessionData.participants || []);
        setMessages(sessionData.messages || []);
        setLoading(false);
      } else {
        console.log("Session not found:", sessionId);
        setError("Session not found");
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to session:", error);
      setError(`Error loading session: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  useEffect(() => {
    if (session && user) {
      // Check if user is a participant
      const isParticipant = participants.some(p => p.userId === user.uid);
      
      // If user is not a participant, try to add them automatically
      if (!isParticipant) {
        // Check if session is still available for joining
        if (session.currentParticipants >= session.maxParticipants) {
          setError("This session is full");
          return;
        }
        
        if (session.status !== "waiting") {
          setError("This session is no longer available");
          return;
        }

        // Automatically add user to session (prevent duplicate calls)
        if (!isAddingUserRef.current) {
          isAddingUserRef.current = true;
          addUserToSession().finally(() => {
            isAddingUserRef.current = false;
          });
        }
        return;
      }

      // Initialize WebRTC for voice sessions (prevent duplicate initialization)
      if (session.sessionType === "voice" && !isInitializingWebRTCRef.current) {
        isInitializingWebRTCRef.current = true;
        initializeWebRTC();
      }
    }
  }, [session, participants, user]);

  const addUserToSession = async () => {
    try {
      console.log("Adding user to session:", { sessionId, userId: user.uid, session });
      
      if (!session) {
        console.log("Session not loaded yet, waiting...");
        return;
      }
      
      const sessionRef = doc(db, "sessions", sessionId);
      
      // Check if user is already a participant to avoid duplicates
      const isAlreadyParticipant = participants.some(p => p.userId === user.uid);
      if (isAlreadyParticipant) {
        console.log("User is already a participant");
        return;
      }
      
      // Add user to participants
      await updateDoc(sessionRef, {
        participants: arrayUnion({
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          joinedAt: new Date(),
        }),
        currentParticipants: (session.currentParticipants || 0) + 1,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Successfully added user to session");
    } catch (error) {
      console.error("Error adding user to session:", error);
      setError(`Failed to join session: ${error.message}`);
    }
  };

  const initializeWebRTC = async () => {
    try {
      console.log("Initializing WebRTC...");
      
      // Get user media with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      });
      
      console.log("Got user media stream:", stream);
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      // Set up local audio element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.volume = 0; // Mute local audio to prevent echo
        console.log("Set local audio element");
      }

      // Set up peer connections for other participants
      participants.forEach(participant => {
        if (participant.userId !== user.uid) {
          console.log("Creating peer connection for:", participant.userId);
          createPeerConnection(participant.userId);
        }
      });

      setIsConnected(true);
      console.log("WebRTC initialized successfully");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Unable to access microphone. Please check your permissions and try again.");
    }
  };

  const createPeerConnection = (userId) => {
    console.log("Creating peer connection for user:", userId);
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ],
      iceCandidatePoolSize: 10
    });

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log("Adding track to peer connection:", track.kind);
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log("Received remote track from:", userId);
      const remoteStream = event.streams[0];
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
      
      // Set up remote audio element
      const remoteAudio = remoteVideoRefs.current.get(userId);
      if (remoteAudio) {
        remoteAudio.srcObject = remoteStream;
        remoteAudio.volume = isSpeakerOn ? 1 : 0;
        console.log("Set remote audio element for:", userId);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate generated for:", userId);
        // In a real implementation, you'd send this to the other peer via signaling server
        // For now, we'll just log it
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, peerConnection.connectionState);
    };

    peerConnections.current.set(userId, peerConnection);
    
    // For demo purposes, create a simple connection
    // In a real app, you'd exchange offers/answers via signaling server
    createSimpleConnection(peerConnection, userId);
  };

  const createSimpleConnection = async (peerConnection, userId) => {
    try {
      console.log("Creating connection for:", userId);
      
      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }
      
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log("Created offer for:", userId);
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream for:", userId);
        const remoteStream = event.streams[0];
        setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
        
        // Set up remote audio element
        const remoteAudio = remoteVideoRefs.current.get(userId);
        if (remoteAudio) {
          remoteAudio.srcObject = remoteStream;
          remoteAudio.play().catch(e => console.error("Error playing remote audio:", e));
        }
      };
      
      // For demo purposes, create a simple connection
      // In production, you'd exchange offers/answers via signaling server
      setTimeout(async () => {
        try {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setRemoteDescription(offer);
          await peerConnection.setLocalDescription(answer);
          console.log("Connection established for:", userId);
        } catch (error) {
          console.error("Error creating answer:", error);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error creating connection:", error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    
    // Update volume for all remote audio elements
    remoteVideoRefs.current.forEach((audioElement) => {
      if (audioElement) {
        audioElement.volume = newSpeakerState ? 1 : 0;
      }
    });
    
    console.log("Speaker toggled:", newSpeakerState ? "ON" : "OFF");
  };

  const leaveSession = async (endForAll = false) => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Close peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();

      // Remove user from session or end session for all
      if (session && user) {
        if (endForAll) {
          // End session for all participants
          await updateDoc(doc(db, "sessions", session.id), {
            status: "ended",
            endedBy: user.uid,
            endedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          // Remove only current user
          const participantToRemove = participants.find(p => p.userId === user.uid);
          if (participantToRemove) {
            await updateDoc(doc(db, "sessions", session.id), {
              participants: arrayRemove(participantToRemove),
              currentParticipants: Math.max(0, session.currentParticipants - 1),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      // Redirect based on user type
      const userType = user?.userType || "seeker";
      window.location.href = userType === "volunteer" 
        ? "/volunteer/dashboard" 
        : "/seeker/dashboard";
    } catch (error) {
      console.error("Error leaving session:", error);
      alert("Error leaving session. Please try again.");
    }
  };

  const fixCorruptedSession = async () => {
    try {
      console.log("Attempting to fix corrupted session data...");
      const sessionRef = doc(db, "sessions", session.id);
      
      // Reset messages to empty array and fix any other issues
      await setDoc(sessionRef, {
        messages: [],
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log("Session data fixed successfully");
      return true;
    } catch (error) {
      console.error("Failed to fix session data:", error);
      return false;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session || !user) {
      console.log("Cannot send message:", { newMessage: newMessage.trim(), session: !!session, user: !!user });
      return;
    }

    try {
      const message = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        type: "text"
      };

      console.log("Sending message:", message);

      // Always use setDoc with merge to ensure proper array handling
      const sessionRef = doc(db, "sessions", session.id);
      
      // Get current messages or initialize empty array
      const currentMessages = session.messages && Array.isArray(session.messages) 
        ? session.messages 
        : [];
      
      // Add new message to the array
      const updatedMessages = [...currentMessages, message];
      
      // Use setDoc with merge to update the messages array
      await setDoc(sessionRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log("Message sent successfully");
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        sessionId: session.id,
        hasMessages: !!session.messages,
        messagesType: typeof session.messages,
        messagesValue: session.messages,
        isArray: Array.isArray(session.messages)
      });
      
      // Try to fix corrupted session data
      if (error.code === 'invalid-argument' || error.message.includes('corrupted')) {
        console.log("Attempting to fix corrupted session data...");
        const fixed = await fixCorruptedSession();
        if (fixed) {
          // Automatically retry sending the message after fixing
          try {
            const message = {
              id: Date.now().toString(),
              userId: user.uid,
              userName: user.displayName || user.email || "Anonymous",
              message: newMessage.trim(),
              timestamp: serverTimestamp(),
              type: "text"
            };

            const sessionRef = doc(db, "sessions", session.id);
            await setDoc(sessionRef, {
              messages: [message], // Start fresh with just this message
              updatedAt: serverTimestamp(),
            }, { merge: true });

            console.log("Message sent successfully after data repair");
            setNewMessage("");
            return;
          } catch (retryError) {
            console.error("Failed to send message even after data repair:", retryError);
            alert("Session data has been fixed, but there was still an error sending your message. Please try again.");
            return;
          }
        }
      }
      
      let errorMessage = "Failed to send message. Please try again.";
      if (error.code === 'permission-denied') {
        errorMessage = "You don't have permission to send messages in this session.";
      } else if (error.code === 'not-found') {
        errorMessage = "Session not found. Please refresh the page.";
      } else if (error.code === 'invalid-argument') {
        errorMessage = "Invalid session data. Please refresh the page.";
      } else if (error.message.includes('arrayUnion') || error.message.includes('corrupted')) {
        errorMessage = "Session data is corrupted. Please refresh the page.";
      }
      
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full mx-auto mb-6 animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-teal-500 border-r-blue-600"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Joining session...
          </h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhoneOff className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Session Not Found</h1>
            <p className="text-gray-600 mb-8">This session may have ended or doesn't exist.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50'}`}>
      {/* Modern Header with Glassmorphism */}
      <div className={`backdrop-blur-xl px-6 py-5 border-b shadow-lg sticky top-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-teal-100/50'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {session.title}
              </h1>
              <p className={`text-sm flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="inline-flex items-center">
                  {session.sessionType === "voice" ? "🎤 Voice Call" : "💬 Text Chat"}
                </span>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
                <span className="inline-flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {participants.length} active
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-xl shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{participants.length}/{session.maxParticipants}</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLeaveOptions(!showLeaveOptions)}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Leave Session
              </button>
              
              {showLeaveOptions && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border z-50 overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowLeaveOptions(false);
                        leaveSession(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Leave for myself</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowLeaveOptions(false);
                        leaveSession(true);
                      }}
                      className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>End session for all</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
      {/* Main Content */}
        <div className="flex-1 flex flex-col bg-transparent">
          {session.sessionType === "voice" ? (
            /* Voice Call Interface */
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 blur-3xl"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
                {/* Local Video/Audio */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-teal-100/60 transform transition-all duration-300 hover:shadow-3xl hover:border-teal-200">
                  <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <img 
                        src="https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=500&h=300&fit=crop" 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl ring-4 ring-white/50">
                        <span className="text-3xl font-bold text-white">
                          {(user?.displayName || "You")[0].toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 bg-white/80 px-4 py-1 rounded-full">You</p>
                    </div>
                  </div>
                  <audio ref={localVideoRef} autoPlay muted />
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${localStream ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-xs font-medium text-gray-600">
                        {localStream ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isMuted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isMuted ? "Muted" : "Active"}
                    </div>
                  </div>
                </div>

                {/* Remote Participants */}
                {participants.filter(p => p.userId !== user.uid).map((participant, index) => (
                  <div key={participant.userId} className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50 transform transition-all duration-300 hover:shadow-3xl">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                      {/* Decorative background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <img 
                          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=300&fit=crop" 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl ring-4 ring-white/50">
                          <span className="text-3xl font-bold text-white">
                            {participant.userName[0].toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 bg-white/80 px-4 py-1 rounded-full">{participant.userName}</p>
                      </div>
                    </div>
                    <audio 
                      ref={el => {
                        if (el) remoteVideoRefs.current.set(participant.userId, el);
                      }} 
                      autoPlay 
                      volume={isSpeakerOn ? 1 : 0}
                    />
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${remoteStreams.has(participant.userId) ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                        <span className="text-xs font-medium text-gray-600">
                          {remoteStreams.has(participant.userId) ? "Connected" : "Connecting..."}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${isSpeakerOn ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {isSpeakerOn ? "Speaker ON" : "Speaker OFF"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 blur-3xl"></div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-8 overflow-y-auto z-10">
                <div className="max-w-4xl mx-auto space-y-6">
                  {session.messages?.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-10 h-10 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Start the conversation</h3>
                      <p className="text-gray-600">Send a message to begin your session</p>
                    </div>
                  )}
                  {session.messages?.map((message) => (
                    <div key={message.id} className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                      <div className={`max-w-md lg:max-w-lg group ${message.userId === user.uid ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-2 mb-1 px-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            message.userId === user.uid 
                              ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white' 
                              : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                          }`}>
                            {message.userName[0].toUpperCase()}
                          </div>
                          <p className="text-xs font-semibold text-gray-700">{message.userName}</p>
                        </div>
                        <div className={`px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm transform transition-all duration-200 hover:scale-[1.02] ${
                          message.userId === user.uid 
                            ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white/90 text-gray-800 border border-gray-200 rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.message}</p>
                          <p className={`text-xs mt-2 ${
                            message.userId === user.uid ? 'text-teal-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp?.toDate?.() || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            
              {/* Message Input */}
              <div className="bg-white/80 backdrop-blur-md border-t border-white/50 p-6 z-10">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={sendMessage} className="flex space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-white border-2 border-gray-200 text-gray-900 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                      <span>Send</span>
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
          </div>
        )}

      {/* Controls */}
          {session.sessionType === "voice" && (
            <div className="bg-white/80 backdrop-blur-md border-t border-white/50 p-6 z-10">
              <div className="max-w-4xl mx-auto flex items-center justify-center space-x-6">
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isMuted 
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  onClick={toggleSpeaker}
                  className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isSpeakerOn 
                      ? 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                  }`}
                  title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => {
                    // Test audio playback
                    if (localVideoRef.current) {
                      localVideoRef.current.play().then(() => {
                        console.log("Local audio playing");
                      }).catch(e => console.error("Local audio play failed:", e));
                    }
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  title="Test Audio"
                >
                  <span className="text-xl">🔊</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Participants Sidebar */}
        <div className="w-96 bg-white/90 backdrop-blur-md border-l border-white/50 p-8 overflow-y-auto">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Participants</h3>
              <p className="text-sm text-gray-600">{participants.length} in session</p>
            </div>
          </div>

          <div className="space-y-4">
            {participants.map((participant, index) => (
              <div 
                key={participant.userId} 
                className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    participant.userId === user.uid
                      ? 'bg-gradient-to-br from-teal-500 to-blue-600'
                      : 'bg-gradient-to-br from-purple-500 to-pink-600'
                  }`}>
                    {participant.userName[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 flex items-center space-x-2">
                      <span>{participant.userName}</span>
                      {participant.userId === user.uid && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">You</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Active now</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Session Info Card */}
          <div className="mt-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>Session Info</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="font-medium text-gray-800">
                  {session.sessionType === "voice" ? "Voice Call" : "Text Chat"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max Participants:</span>
                <span className="font-medium text-gray-800">{session.maxParticipants}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}