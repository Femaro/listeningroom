"use client";

import { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  Loader,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function VoiceCallModal({
  isOpen,
  onClose,
  sessionId,
  isInitiator = false,
  partnerName = "Volunteer",
}) {
  const [callState, setCallState] = useState("connecting"); // connecting, connected, ended, failed
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState("good"); // good, fair, poor
  const [lastMessageId, setLastMessageId] = useState(0);

  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const statsIntervalRef = useRef(null);

  // Enhanced WebRTC configuration with multiple STUN/TURN servers
  const rtcConfig = {
    iceServers: [
      // STUN servers (free)
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
      // TURN servers (production)
      ...(process.env.NEXT_PUBLIC_TURN_SERVERS
        ? JSON.parse(process.env.NEXT_PUBLIC_TURN_SERVERS).map((server) => ({
            urls: server.urls,
            username: server.username,
            credential: server.credential,
          }))
        : []),
      // Fallback TURN server if configured
      ...(process.env.NEXT_PUBLIC_TURN_SERVER_URL
        ? [
            {
              urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
              username: process.env.NEXT_PUBLIC_TURN_USERNAME,
              credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
            },
          ]
        : []),
    ],
    iceCandidatePoolSize: 10,
    // Production optimizations
    iceTransportPolicy: "all", // Use both STUN and TURN
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, sessionId]);

  useEffect(() => {
    let interval;
    if (callState === "connected" && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - callStartTimeRef.current) / 1000,
        );
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const initializeCall = async () => {
    try {
      setError(null);
      setCallState("connecting");

      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support voice calling. Please use Chrome, Firefox, or Safari.",
        );
      }

      // Get user media with enhanced audio settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: false,
      });

      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      // Add local stream
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream");
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current
            .play()
            .catch((e) => console.log("Auto-play failed:", e));
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal("ice-candidate", {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log("Connection state:", state);

        if (state === "connected") {
          setCallState("connected");
          callStartTimeRef.current = Date.now();
          startConnectionQualityMonitoring();
        } else if (state === "disconnected") {
          setCallState("ended");
          setError("Connection lost");
        } else if (state === "failed") {
          setCallState("failed");
          setError("Connection failed. Please try again.");
        }
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        console.log("ICE connection state:", state);

        if (state === "disconnected" || state === "failed") {
          setConnectionQuality("poor");
        }
      };

      // Start signaling
      startSignaling();

      if (isInitiator) {
        // Create and send offer
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await peerConnection.setLocalDescription(offer);

        sendSignal("offer", {
          sdp: offer.sdp,
          type: offer.type,
        });
      }
    } catch (error) {
      console.error("Error initializing call:", error);
      let errorMessage = "Failed to start call. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No microphone found. Please check your audio device.";
      } else {
        errorMessage +=
          error.message || "Please check your connection and try again.";
      }

      setError(errorMessage);
      setCallState("failed");
    }
  };

  const startSignaling = () => {
    // Poll for signaling messages
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/websocket/signaling?sessionId=${sessionId}&lastMessageId=${lastMessageId}`,
        );
        if (response.ok) {
          const data = await response.json();

          for (const message of data.messages) {
            await handleSignalMessage(message);
            setLastMessageId(Math.max(lastMessageId, message.id));
          }
        }
      } catch (error) {
        console.error("Signaling polling error:", error);
      }
    }, 1000);
  };

  const sendSignal = async (type, data) => {
    try {
      await fetch("/api/websocket/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type,
          data,
        }),
      });
    } catch (error) {
      console.error("Failed to send signal:", error);
    }
  };

  const handleSignalMessage = async (message) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    try {
      switch (message.type) {
        case "offer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(message.data),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          sendSignal("answer", {
            sdp: answer.sdp,
            type: answer.type,
          });
          break;

        case "answer":
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(message.data),
          );
          break;

        case "ice-candidate":
          const candidate = new RTCIceCandidate({
            candidate: message.data.candidate,
            sdpMLineIndex: message.data.sdpMLineIndex,
            sdpMid: message.data.sdpMid,
          });
          await peerConnection.addIceCandidate(candidate);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling signal message:", error);
    }
  };

  const startConnectionQualityMonitoring = () => {
    statsIntervalRef.current = setInterval(async () => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      try {
        const stats = await peerConnection.getStats();

        for (const report of stats.values()) {
          if (report.type === "inbound-rtp" && report.mediaType === "audio") {
            // Monitor packet loss and audio quality
            if (report.packetsLost > 5) {
              setConnectionQuality("poor");
            } else if (report.packetsLost > 2) {
              setConnectionQuality("fair");
            } else {
              setConnectionQuality("good");
            }
          }
        }
      } catch (error) {
        console.error("Stats monitoring error:", error);
      }
    }, 5000);
  };

  const handleEndCall = () => {
    setCallState("ended");
    cleanup();
    onClose();
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
    setIsSpeakerOn(!isSpeakerOn);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 0 : 1;
    }
  };

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    localStreamRef.current = null;
    peerConnectionRef.current = null;
    callStartTimeRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case "good":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "fair":
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case "poor":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Call Status */}
        <div className="mb-8">
          {callState === "connecting" && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-10 h-10 text-teal-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Connecting...
                </h3>
                <p className="text-gray-600">
                  Establishing secure voice connection
                </p>
              </div>
            </div>
          )}

          {callState === "connected" && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Connected with {partnerName}
                </h3>
                <p className="text-2xl font-mono font-bold text-green-600">
                  {formatTime(callDuration)}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Secure connection</span>
                  {getConnectionIcon()}
                </div>
              </div>
            </div>
          )}

          {(callState === "ended" || callState === "failed") && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <PhoneOff className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {callState === "failed" ? "Call Failed" : "Call Ended"}
                </h3>
                {error ? (
                  <p className="text-red-600 text-sm">{error}</p>
                ) : (
                  <p className="text-gray-600">
                    Call duration: {formatTime(callDuration)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {callState === "connected" && (
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`p-4 rounded-full transition-colors ${
                !isSpeakerOn
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isSpeakerOn ? "Mute speaker" : "Unmute speaker"}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Connection Quality Indicator */}
        {callState === "connected" && connectionQuality !== "good" && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              {getConnectionIcon()}
              <span className="text-yellow-800 text-sm">
                {connectionQuality === "fair"
                  ? "Connection quality is fair"
                  : "Poor connection quality"}
              </span>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Secure & Private</p>
              <ul className="space-y-1 text-xs">
                <li>• End-to-end encrypted voice connection</li>
                <li>• No recordings or storage of conversations</li>
                <li>• Phone numbers remain private</li>
                <li>• Connection automatically ends with chat session</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(callState === "ended" || callState === "failed" || error) && (
          <div className="mt-6 space-y-3">
            {callState === "failed" && (
              <button
                onClick={() => {
                  setError(null);
                  setCallState("connecting");
                  initializeCall();
                }}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Hidden audio elements */}
        <audio ref={localAudioRef} muted />
        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
}
