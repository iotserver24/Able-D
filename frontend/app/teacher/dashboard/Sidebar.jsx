// app/teacher/dashboard/Sidebar.jsx
import React from 'react';

const HomeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const ExitIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const CloseIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, setActiveView, darkMode, setDarkMode }) {
  const buttonClasses = `flex items-center w-full px-4 py-3 space-x-4 rounded-xl transition-colors duration-300 ${
    darkMode
      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
  }`;

  // NEW: A single handler for all sidebar button clicks
  const handleSidebarAction = (action) => {
    // Perform the button's primary action
    action();

    // If on a mobile-sized screen, close the sidebar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`fixed top-0 left-0 z-40 flex flex-col justify-between w-64 h-screen p-4 backdrop-blur-xl border-r transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode
            ? "bg-gray-900/30 border-gray-700/50"
            : "bg-white/30 border-gray-200/50"
    }`}>
      
      <button
        onClick={() => setIsSidebarOpen(false)}
        className={`absolute top-5 right-5 p-2 rounded-full transition-all ${
          darkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-black/10'
        }`}
        aria-label="Close sidebar"
      >
        <CloseIcon />
      </button>

      <div>
        <div className="flex items-center space-x-3 p-2 mb-10 mt-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                darkMode
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500"
            }`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
                <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>EduPortal</h1>
            </div>
        </div>

        <ul>
          <li>
            <button 
              onClick={() => handleSidebarAction(() => setActiveView('menu'))} 
              className={`group w-full relative px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-4 ${
                darkMode
                  ? "bg-gray-800/50 text-gray-200 hover:bg-gray-700/50"
                  : "bg-white/50 text-gray-700 hover:bg-white/70"
              }`}
            >
              <HomeIcon />
              <span className="font-semibold">Home</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSidebarAction(() => setDarkMode(!darkMode))}
          className={`group w-full relative px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
            darkMode
              ? "bg-gray-800/50 text-gray-200 hover:bg-gray-700/50"
              : "bg-white/50 text-gray-700 hover:bg-white/70"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </span>
        </button>

         <button onClick={() => handleSidebarAction(() => setActiveView('menu'))} className={buttonClasses}>
            <ExitIcon />
            <span className="font-semibold">Exit</span>
        </button>
      </div>
    </div>
  );
}