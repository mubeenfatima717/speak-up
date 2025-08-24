// components/SessionView.js
"use client";

import { useEffect, useRef } from "react"; // ADDED: Imports for hooks
import {
  UserIcon,
  MicOnIcon,
  VideoOnIcon,
  VideoOffIcon,
} from "./Icons";

export default function SessionView({
  // Props for session data
  activeScenario,
  isRecording,
  countdown,
  conversation,
  isResponding,
  isListening,

  // Props for UI controls
  isVideoOn,
  onToggleVideo,
  videoStreamRef, // ADDED: Prop to receive the video stream
  
  // Props for session actions
  onEndSession,
  onToggleListening,
}) {
  
  const videoRef = useRef(null); // ADDED: Local ref for the <video> element

  // ADDED: This effect connects the stream to the video element
 useEffect(() => {
  // This effect now correctly and reliably runs whenever the isVideoOn prop changes.
  if (isVideoOn && videoRef.current && videoStreamRef.current) {
    // When video is toggled ON, and the elements are ready, attach the stream.
    videoRef.current.srcObject = videoStreamRef.current;
  } else if (videoRef.current) {
    // When video is toggled OFF, or if anything is missing, clear the video source.
    videoRef.current.srcObject = null;
  }
}, [isVideoOn]); // The dependency is now a state variable, which is the correct React pattern.
  const getLastAiMessage = () => {
    return conversation.filter(msg => msg.role === 'ai').pop()?.content;
  };

  return (
    <div className="flex-1 flex flex-col p-6 pt-0">
      {/* --- RECORDING INDICATOR (Unchanged) --- */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/80 border border-gray-700 rounded-full px-4 py-2 text-sm flex items-center z-10">
        {isRecording ? (
          <>
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            <span>Recording...</span>
          </>
        ) : (
          <span>
            Recording starts in:{" "}
            <span className="font-bold text-lg">{countdown}</span>
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* --- USER PANEL (MODIFIED FOR VIDEO) --- */}
          <div className="border border-gray-700 bg-gray-800 rounded-lg flex flex-col items-center justify-between relative p-4 overflow-hidden">
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
              You
            </div>
            
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-center">
              {/* MODIFIED: Replaced placeholder with real video element and conditional rendering */}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className={`w-full h-full object-cover rounded-md ${isVideoOn ? "block" : "hidden"}`} 
              />
              {!isVideoOn && (
                <div className="flex flex-col items-center justify-center">
                  <UserIcon className="w-24 h-24 text-gray-600" />
                  <p className="text-gray-500 mt-2">Your camera is off</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={onToggleListening}
                disabled={isResponding} // Logic is preserved
                className={`p-3 rounded-full transition-colors ${
                  isListening ? "bg-red-600 animate-pulse" : "bg-purple-600"
                } disabled:bg-gray-600`}
              >
                <MicOnIcon className="w-6 h-6" />
              </button>
              <button
                onClick={onToggleVideo}
                className="p-3 rounded-full bg-gray-700"
              >
                {isVideoOn ? ( // Logic is preserved
                  <VideoOnIcon className="w-6 h-6" />
                ) : (
                  <VideoOffIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* --- AI PANEL (Unchanged) --- */}
          <div className="border border-gray-700 bg-gray-800 rounded-lg flex flex-col items-center justify-center relative p-4">
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
              {activeScenario.persona}
            </div>
            <img
              src={activeScenario.avatar}
              alt="AI Avatar"
              className="w-36 h-36 rounded-full"
            />
            <div className="mt-4 text-center text-lg px-6 flex-grow overflow-y-auto w-full flex items-center justify-center">
              {isResponding ? (
                <span className="italic text-gray-400">Thinking...</span>
              ) : (
                <p>"{getLastAiMessage()}"</p>
              )}
            </div>
          </div>
        </div>

        {/* --- FOOTER (Unchanged) --- */}
        <footer className="mt-6 flex justify-center">
          <button
            onClick={onEndSession}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors"
          >
            End Session
          </button>
        </footer>
      </div>
    </div>
  );
}