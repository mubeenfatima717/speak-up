// components/Header.js
"use client";

import {
  SidebarToggleIcon,
  UserIcon,
} from "./Icons";

export default function Header({
  // Props for user data and actions
  user,
  isProfileDropdownOpen,
  onToggleProfileDropdown,
  onOpenAuthModal,
  onLogout,

  // Props for controlling the sidebar
  onToggleSidebar,
}) {
  return (
    <header className="flex items-center justify-between p-4 h-16 flex-shrink-0">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700/50"
        >
          <SidebarToggleIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <a
          href="/subscription"
          className="bg-purple-600 hover:bg-purple-700 text-sm font-semibold rounded-lg px-4 py-2 flex items-center"
        >
          ✨ Upgrade Plan
        </a>
        <div className="relative">
          {user ? (
            // LOGGED-IN USER ICON
            <button
              onClick={onToggleProfileDropdown}
              title="Profile options"
              className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-400 hover:border-purple-400 transition-colors"
            >
              {user.email.charAt(0).toUpperCase()}
            </button>
          ) : (
            // GUEST ICON
            <button
              onClick={onOpenAuthModal}
              title="Login or Sign Up"
              className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-400 hover:border-purple-400 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}

          {/* PROFILE DROPDOWN MENU */}
          {isProfileDropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-gray-600 rounded-md shadow-lg py-1 z-20">
              <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-600">
                Signed in as <br />
                <span className="font-semibold text-white truncate block">
                  {user.email}
                </span>
              </div>
              <a
                href="#"
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-colors"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}