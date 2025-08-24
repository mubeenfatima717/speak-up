// components/Sidebar.js
"use client";

import {
  LogoIcon,
  PlusIcon,
  HistoryIcon,
  TrashIcon,
  ChevronDownIcon,
} from "./Icons";

export default function Sidebar({
  // Props for controlling the sidebar
  isOpen,

  // Props for user data and actions
  user,

  // Props for session data and actions
  scenarios,
  onStartSession,
  onEndSession,

  // Props for history section
  isHistoryOpen,
  historyItems,
  onToggleHistory,
  onDeleteSession,

  // Props for authentication
  onOpenAuthModal,
  onHistoryItemClick,
}) {
  return (
    <aside
      className={`bg-[#111827] flex flex-col flex-shrink-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-4 space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <a href="#" onClick={onEndSession} className="flex items-center space-x-3">
            <LogoIcon className="w-8 h-8 text-purple-400" />
            <span className="font-bold text-xl">SpeakUp</span>
          </a>
        </div>
        <button
          onClick={onEndSession}
          className="flex items-center w-full bg-gray-700 hover:bg-gray-600 rounded-md p-2 text-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Session
        </button>
        <nav className="flex-1 space-y-1">
          <p className="text-xs text-gray-400 font-semibold px-2 mb-2">
            SCENARIOS
          </p>
          {scenarios.map((scenario) => (
            <a
              key={scenario.id}
              href="#"
              onClick={() => onStartSession(scenario)}
              className="flex items-center p-2 rounded-md text-sm hover:bg-gray-700/50"
            >
              {scenario.icon}
              <span className="ml-3">{scenario.name}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto">
  {user ? (
    <>
      <button
        onClick={onToggleHistory}
        className="w-full flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-700/50"
      >
        <div className="flex items-center">
          <HistoryIcon className="w-5 h-5 mr-3" />
          <span>Recent History</span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isHistoryOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isHistoryOpen && (
        <div className="mt-2 space-y-1 pl-4">
          {/* --- THIS IS THE EMPTY STATE LOGIC --- */}
          
           
{historyItems.length > 0 ? (
  historyItems.map((session) => (
    <div key={session.id} className="group flex items-center justify-between rounded-md hover:bg-gray-700/50">
      
      {/* --- THIS IS THE CRITICAL CHANGE --- */}
      {/* We are replacing the <a> tag with a <button> to make the whole item clickable */}
      {/* and calling the onHistoryItemClick function we passed from page.js */}
      <button
        onClick={() => onHistoryItemClick(session.id)}
        className="block truncate text-left text-sm p-2 text-gray-300 flex-grow"
      >
        <span className="font-medium">{session.scenarioName}</span>
        <span className="text-xs text-gray-400 block">
          {new Date(session.createdAt?.toDate()).toLocaleDateString()}
        </span>
        {/* --- NEW: Show the status of the report --- */}
        {session.status === 'processing' && (
          <span className="text-xs text-yellow-400 block animate-pulse">Generating report...</span>
        )}
        {session.status === 'failed' && (
          <span className="text-xs text-red-400 block">Report failed</span>
        )}
      </button>

      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent the report from opening when deleting
          onDeleteSession(session.id);
        }}
        className="ml-2 p-1 mr-1 rounded-md text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 focus:opacity-100 transition-opacity"
        title="Delete session"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

    </div>
  ))
) : (
            <p className="text-xs text-gray-500 px-2">
              No session history yet.
            </p>
          )}
        </div>
      )}
    </>
  ) : (
            <div className="text-center p-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Please log in to save and view your session history.
              </p>
              <button
                onClick={onOpenAuthModal}
                className="mt-3 text-sm font-semibold text-purple-400 hover:text-purple-300"
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}