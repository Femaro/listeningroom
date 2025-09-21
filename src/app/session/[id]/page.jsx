"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, MessageCircle, Users, Settings, Volume2, VolumeX } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";

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

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const peerConnections = useRef(new Map());
  const localStreamRef = useRef(null);

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

        // Automatically add user to session
        addUserToSession();
        return;
      }

      // Initialize WebRTC for voice sessions
      if (session.sessionType === "voice") {
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
      // For a simple demo, we'll create a basic connection
      // In a real app, you'd use a signaling server to exchange offers/answers
      console.log("Creating simple connection for:", userId);
      
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log("Created offer for:", userId);
      
      // For demo purposes, we'll create a loopback connection
      // This simulates receiving an answer from the other peer
      setTimeout(async () => {
        try {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setRemoteDescription(offer);
          await peerConnection.setLocalDescription(answer);
          console.log("Created answer for:", userId);
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

  const leaveSession = async () => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Close peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();

      // Remove user from session
      if (session && user) {
        // Find the participant object to remove
        const participantToRemove = participants.find(p => p.userId === user.uid);
        if (participantToRemove) {
          await updateDoc(doc(db, "sessions", session.id), {
            participants: arrayRemove(participantToRemove),
            currentParticipants: Math.max(0, session.currentParticipants - 1),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Redirect based on user type
      const userType = userProfile?.userType || "seeker";
      window.location.href = userType === "volunteer" 
        ? "/volunteer/dashboard" 
        : "/seeker/dashboard";
    } catch (error) {
      console.error("Error leaving session:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    try {
      const message = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        type: "text"
      };

      await updateDoc(doc(db, "sessions", session.id), {
        messages: arrayUnion(message),
        updatedAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Joining session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Not Found</h1>
          <p className="text-gray-300 mb-6">This session may have ended or doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <p className="text-gray-400 text-sm">
              {session.sessionType === "voice" ? "Voice Call" : "Text Chat"} • {participants.length} participants
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{participants.length}/{session.maxParticipants}</span>
            </div>
            <button
              onClick={leaveSession}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Leave Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
      {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {session.sessionType === "voice" ? (
            /* Voice Call Interface */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {/* Local Video/Audio */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="aspect-video bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold">
                          {(user?.displayName || "You")[0].toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">You</p>
                    </div>
              </div>
                  <audio ref={localVideoRef} autoPlay muted />
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Local Audio: {localStream ? "Connected" : "Not connected"}</div>
                    <div>Muted: {isMuted ? "Yes" : "No"}</div>
                  </div>
          </div>

                {/* Remote Participants */}
                {participants.filter(p => p.userId !== user.uid).map((participant, index) => (
                  <div key={participant.userId} className="bg-gray-800 rounded-lg p-4">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold">
                            {participant.userName[0].toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{participant.userName}</p>
            </div>
          </div>
                    <audio 
                      ref={el => {
                        if (el) remoteVideoRefs.current.set(participant.userId, el);
                      }} 
                      autoPlay 
                      volume={isSpeakerOn ? 1 : 0}
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      <div>Remote Audio: {remoteStreams.has(participant.userId) ? "Connected" : "Not connected"}</div>
                      <div>Speaker: {isSpeakerOn ? "ON" : "OFF"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {session.messages?.map((message) => (
                    <div key={message.id} className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.userId === user.uid 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm font-medium">{message.userName}</p>
                        <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                          {new Date(message.timestamp?.toDate?.() || message.timestamp).toLocaleTimeString()}
                      </p>
                      </div>
                    </div>
                  ))}
                  </div>
            </div>
            
              {/* Message Input */}
              <div className="border-t border-gray-700 p-4">
                <form onSubmit={sendMessage} className="flex space-x-4">
                <input
                  type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  type="submit"
                    className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg transition-colors"
                >
                    Send
                </button>
                </form>
              </div>
          </div>
        )}

      {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="flex items-center justify-center space-x-4">
              {session.sessionType === "voice" && (
                <>
          <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
                    onClick={toggleSpeaker}
                    className={`p-3 rounded-full transition-colors ${
                      isSpeakerOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
                </>
              )}

          <button
                onClick={() => {
                  // Test audio playback
                  if (localVideoRef.current) {
                    localVideoRef.current.play().then(() => {
                      console.log("Local audio playing");
                    }).catch(e => console.error("Local audio play failed:", e));
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors"
                title="Test Audio"
              >
                🔊
          </button>

          <button
                onClick={leaveSession}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
          </button>
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Participants</h3>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.userId} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="font-bold">
                    {participant.userName[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{participant.userName}</p>
                  <p className="text-sm text-gray-400">
                    {participant.userId === user.uid ? "You" : "Participant"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}