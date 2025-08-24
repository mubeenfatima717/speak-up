
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "./context/AuthContext";
// import { auth, db } from "./firebaseConfig";
// import { signOut } from "firebase/auth";
// import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
// import useMediaDevices from "./hooks/useMediaDevices";
// import useSession from "./hooks/useSession";
// import { scenarios } from "./data/scenarios"

// // Component Imports
// import AuthModal from "./components/AuthModal";
// import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";
// import SessionView from "./components/SessionView";
// import useFirestoreHistory from "./hooks/useFirestoreHistory";



// export default function SpeakUpPage() {
//   // --- State Management ---
//   const { user } = useAuth();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//    const { isVideoOn, isRecording, videoStreamRef, startScreenRecording, handleToggleVideo, cleanupMediaStreams } = useMediaDevices();
//  const { historyItems, saveSession, deleteSession } = useFirestoreHistory(user); 
//  const recognitionRef = useRef(null); 
//  const { activeScenario, conversation, countdown, isListening, isResponding, isSpeechRecognitionSupported, startSession: coreStartSession, endSession: coreEndSession, handleToggleListening } = useSession(); 


//   const handleUserSpeech = async (transcript) => {
//     const updatedConversation = [...conversation, { role: 'user', content: transcript }];
//     setConversation(updatedConversation);
//     setIsResponding(true);
//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: transcript }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error.message || 'An unknown error occurred.');
//       const aiTextReply = data.reply;
//       speakText(aiTextReply);
//       setConversation([...updatedConversation, { role: 'ai', content: aiTextReply }]);
//     } catch (error) {
//       console.error("Failed to get AI response:", error);
//       const errorMessage = `Error: ${error.message}`;
//       speakText(errorMessage);
//       setConversation([...updatedConversation, { role: 'ai', content: errorMessage }]);
//     } finally {
//       setIsResponding(false);
//     }
//   };

//   // ... after the hook calls ...

// // This new startSession function calls the core session logic AND the media logic
// const startSession = (scenario) => {
//   coreStartSession(scenario);
//   startScreenRecording();
// };

// // This new endSession function calls the core session logic, the media cleanup, AND the firestore saving
// const endSession = () => {
//   coreEndSession();
//   cleanupMediaStreams();
//   saveSession(activeScenario, conversation);
// };

// const handleLogout = async () => {
//   // ... (this function remains unchanged)
// };

// // ... the return statement ...

//   // --- Render ---
//   return (
//     <div className="flex h-screen bg-[#1F2937] text-gray-200 font-sans">
//       <Sidebar
//         isOpen={isSidebarOpen} user={user} scenarios={scenarios}
//         onStartSession={startSession} onEndSession={endSession}
//         isHistoryOpen={isHistoryOpen} historyItems={historyItems}
//         onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
//         onOpenAuthModal={() => setIsModalOpen(true)}
//         onDeleteSession={deleteSession}
//       />
//       <main className="flex-1 flex flex-col relative">
//         <Header
//           user={user} isProfileDropdownOpen={isProfileDropdownOpen}
//           onToggleProfileDropdown={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
//           onOpenAuthModal={() => setIsModalOpen(true)}
//           onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//         />
//         <div className="flex-1 flex flex-col p-6 pt-0">
//           {!activeScenario ? (
//             <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
//               <h1 className="text-5xl font-bold mb-4">Welcome to SpeakUp</h1>
//               <p className="text-gray-400">Select a scenario from the sidebar to begin your practice session.</p>
//               {!isSpeechRecognitionSupported && (
//                 <div className="mt-8 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg max-w-lg">
//                   <p className="font-semibold text-yellow-300">Browser Not Supported</p>
//                   <p className="text-sm text-yellow-400 mt-1">
//                     Your current browser does not support the voice recognition features of this app. For the best experience, please use the latest version of Google Chrome.
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <SessionView
//               activeScenario={activeScenario} isRecording={isRecording}
//               countdown={countdown} conversation={conversation}
//               isResponding={isResponding} isListening={isListening}
//               isVideoOn={isVideoOn} onToggleVideo={handleToggleVideo}
//               videoStreamRef={videoStreamRef} onEndSession={endSession}
//               onToggleListening={handleToggleListening}
//             />
//           )}
//         </div>
//       </main>
//       <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
//     </div>
//   );
// }
// app/page.js
"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { auth, db } from "./firebaseConfig"; // Keep db import for the new function
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import 'getDoc' to fetch a single report

// --- Custom Hook Imports ---
import useMediaDevices from "./hooks/useMediaDevices";
import useSession from "./hooks/useSession";
import useFirestoreHistory from "./hooks/useFirestoreHistory";

// --- Data and Component Imports ---
import { scenarios } from "./data/scenarios";
import AuthModal from "./components/AuthModal";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SessionView from "./components/SessionView";
import ReportView from "./components/ReportView"; // --- NEW: Import ReportView ---

export default function SpeakUpPage() {
  // --- UI State Management ---
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- NEW: State for managing the main view and selected report ---
  const [viewMode, setViewMode] = useState('welcome'); // 'welcome', 'session', or 'report'
  const [selectedReportData, setSelectedReportData] = useState(null);

  // --- Custom Hooks ---
  const { historyItems, saveSession, deleteSession } = useFirestoreHistory(user);
  const { isVideoOn, isRecording, videoStreamRef, startScreenRecording, handleToggleVideo, cleanupMediaStreams } = useMediaDevices();
  const { 
    activeScenario, 
    conversation, 
    countdown, 
    isListening, 
    isResponding, 
    isSpeechRecognitionSupported, 
    transcript, // Get transcript for SessionView
    currentPartIndex, // Get currentPartIndex for SessionView
    startSession: coreStartSession, 
    endSession: coreEndSession, 
    handleToggleListening 
  } = useSession();

  // --- NEW: Function to handle clicking a history item ---
  const handleHistoryItemClick = async (sessionId) => {
    if (!user) return;
    try {
      const sessionDocRef = doc(db, "users", user.uid, "sessions", sessionId);
      const docSnap = await getDoc(sessionDocRef);

      if (docSnap.exists()) {
        setSelectedReportData({ id: docSnap.id, ...docSnap.data() });
        setViewMode('report'); // Switch the view to the report
        if (activeScenario) {
          coreEndSession(); // Clean up any active session state
          cleanupMediaStreams();
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  // --- Orchestrator Functions ---
  const startSession = (scenario) => {
    coreStartSession(scenario);
    startScreenRecording();
    setViewMode('session'); // --- NEW: Set the view mode to 'session' ---
  };

  const endSession = () => {
    // Save session must be called first, as it needs activeScenario and conversation
    saveSession(activeScenario, conversation); 
    // Now, clean up the state
    coreEndSession();
    cleanupMediaStreams();
    setViewMode('welcome'); // --- NEW: Return to welcome screen on end ---
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileDropdownOpen(false);
      setViewMode('welcome'); // Return to welcome screen on logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-[#1F2937] text-gray-200 font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        user={user}
        scenarios={scenarios}
        onStartSession={startSession}
        isHistoryOpen={isHistoryOpen}
        historyItems={historyItems}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onOpenAuthModal={() => setIsModalOpen(true)}
        onDeleteSession={deleteSession}
        onHistoryItemClick={handleHistoryItemClick} // --- NEW: Pass the new handler ---
      />
      <main className="flex-1 flex flex-col relative">
        <Header
          user={user}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onToggleProfileDropdown={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          onOpenAuthModal={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex flex-col p-6 pt-0">
          {/* --- NEW: Conditional Rendering based on viewMode --- */}
          {viewMode === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-5xl font-bold mb-4">Welcome to SpeakUp</h1>
              <p className="text-gray-400">Select a scenario or a past session from the sidebar.</p>
              {!isSpeechRecognitionSupported && (
                <div className="mt-8 p-4 bg-yellow-900/50 border-yellow-700 rounded-lg max-w-lg">
                  <p className="font-semibold text-yellow-300">Browser Not Supported</p>
                  <p className="text-sm text-yellow-400 mt-1">
                    Your browser does not support the voice recognition features. For the best experience, please use Google Chrome.
                  </p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'session' && activeScenario && (
            <SessionView
              activeScenario={activeScenario}
              isRecording={isRecording}
              countdown={countdown}
              conversation={conversation}
              isResponding={isResponding}
              isListening={isListening}
              isVideoOn={isVideoOn}
              onToggleVideo={handleToggleVideo}
              videoStreamRef={videoStreamRef}
              onEndSession={endSession}
              onToggleListening={handleToggleListening}
              transcript={transcript} // Pass live transcript
              currentPartIndex={currentPartIndex} // Pass IELTS part index
            />
          )}

          {viewMode === 'report' && (
            <ReportView reportData={selectedReportData} />
          )}
        </div>
      </main>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}