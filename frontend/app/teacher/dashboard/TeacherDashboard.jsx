// app/teacher/dashboard/TeacherDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import UploadContent from './UploadContent';
import ReviewContent from './ReviewContent';
import ProfileContent from './ProfileContent';

// Inlined CSS for the liquid glass button and NEW burger menu
const componentStylesCSS = `
  /* --- Reactive Background Styles --- */
  .reactive-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    transition: background 0.2s ease-out;
    pointer-events: none;
  }
  .light .reactive-background {
    background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(199, 183, 224, 0.35), transparent 50%);
  }
  .dark .reactive-background {
    background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(123, 97, 255, 0.2), transparent 40%);
  }

  /* --- Button Styles --- */
  @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
  @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
  :root { --anim--hover-time: 400ms; --anim--hover-ease: cubic-bezier(0.25, 1, 0.5, 1); }
  .button-wrap { position: relative; z-index: 2; border-radius: 1.5rem; background: transparent; pointer-events: none; transition: all var(--anim--hover-time) var(--anim--hover-ease); }
  .button-shadow { --shadow-cuttoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cuttoff-fix)); height: calc(100% + var(--shadow-cuttoff-fix)); top: calc(0% - var(--shadow-cuttoff-fix) / 2); left: calc(0% - var(--shadow-cuttoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); -webkit-filter: blur(clamp(2px, 0.125em, 12px)); overflow: visible; pointer-events: none; }
  .button-shadow::after { content: ""; position: absolute; z-index: 0; inset: 0; border-radius: 1.5rem; background: linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)); width: calc(100% - var(--shadow-cuttoff-fix) - 0.25em); height: calc(100% - var(--shadow-cuttoff-fix) - 0.25em); top: calc(var(--shadow-cuttoff-fix) - 0.5em); left: calc(var(--shadow-cuttoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim--hover-time) var(--anim--hover-ease); overflow: visible; opacity: 1; }
  .button-wrap button { --border-width: clamp(1px, 0.0625em, 4px); all: unset; cursor: pointer; position: relative; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); pointer-events: auto; z-index: 3; background: linear-gradient(-75deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05)); border-radius: 1.5rem; box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.25em 0.125em -0.125em rgba(0, 0, 0, 0.2), 0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2), 0 0 0 0 rgba(255, 255, 255, 1); backdrop-filter: blur(clamp(1px, 0.125em, 4px)); -webkit-backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim--hover-time) var(--anim--hover-ease); width: 100%; background-color: rgba(236, 232, 241, 0.4); }
  .dark .button-wrap button { background-color: rgba(30, 25, 40, 0.4); }
  .button-wrap button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); -webkit-backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.15em 0.05em -0.1em rgba(0, 0, 0, 0.25), 0 0 0.05em 0.1em inset rgba(255, 255, 255, 0.5), 0 0 0 0 rgba(255, 255, 255, 1); }
  .button-wrap button span { position: relative; display: block; user-select: none; -webkit-user-select: none; font-family: inherit; letter-spacing: -0.05em; font-weight: 600; font-size: 1em; color: rgba(50, 50, 50, 1); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-shadow: 0em 0.25em 0.05em rgba(0, 0, 0, 0.1); transition: all var(--anim--hover-time) var(--anim--hover-ease); padding-inline: 1.5em; padding-block: 0.875em; }
  .dark .button-wrap button span { color: rgba(230, 230, 240, 1); text-shadow: 0em 0.25em 0.05em rgba(0, 0, 0, 0.4); }
  .button-wrap button:hover span { text-shadow: 0.025em 0.025em 0.025em rgba(0, 0, 0, 0.12); }
  .button-wrap button span::after { content: ""; display: block; position: absolute; z-index: 1; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 1.5rem; overflow: clip; background: linear-gradient(var(--angle-2), rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 40% 50%, rgba(255, 255, 255, 0) 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; background-repeat: no-repeat; transition: background-position calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease), --angle-2 calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease); }
  .button-wrap button:hover span::after { background-position: 25% 50%; }
  .button-wrap button:active span::after { background-position: 50% 15%; --angle-2: -15deg; }
  @media (hover: none) and (pointer: coarse) { .button-wrap button span::after, .button-wrap button:active span::after { --angle-2: -45deg; } }
  .button-wrap button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 1.5rem; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 5% 40%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 60% 95%, rgba(0, 0, 0, 0.5)), linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim--hover-time) var(--anim--hover-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255, 255, 255, 0.5); }
  .button-wrap button:hover::after { --angle-1: -125deg; }
  .button-wrap button:active::after { --angle-1: -75deg; }
  @media (hover: none) and (pointer: coarse) { .button-wrap button::after, .button-wrap button:hover::after, .button-wrap button:active::after { --angle-1: -75deg; } }
  .button-wrap:has(button:hover) .button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); -webkit-filter: blur(clamp(2px, 0.0625em, 6px)); transition: filter var(--anim--hover-time) var(--anim--hover-ease); }
  .button-wrap:has(button:hover) .button-shadow::after { top: calc(var(--shadow-cuttoff-fix) - 0.875em); opacity: 1; }
  .button-wrap:has(button:active) { transform: rotate3d(1, 0, 0, 25deg); }
  .button-wrap:has(button:active) button { box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.125em 0.125em -0.125em rgba(0, 0, 0, 0.2), 0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2), 0 0.225em 0.05em 0 rgba(0, 0, 0, 0.05), 0 0.25em 0 0 rgba(255, 255, 255, 0.75), inset 0 0.25em 0.05em 0 rgba(0, 0, 0, 0.15); }
  .button-wrap:has(button:active) .button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); -webkit-filter: blur(clamp(2px, 0.125em, 12px)); }
  .button-wrap:has(button:active) .button-shadow::after { top: calc(var(--shadow-cuttoff-fix) - 0.5em); opacity: 0.75; }
  .button-wrap:has(button:active) span { text-shadow: 0.025em 0.25em 0.05em rgba(0, 0, 0, 0.12); }
  
  /* --- NEW Burger Menu Styles --- */
  .burger { position: relative; width: 40px; height: 30px; background: transparent; cursor: pointer; display: block; }
  .burger input { display: none; }
  .burger span { display: block; position: absolute; height: 4px; width: 100%; background: black; border-radius: 9px; opacity: 1; left: 0; transform: rotate(0deg); transition: .25s ease-in-out; }
  .dark .burger span { background: white; }
  .burger span:nth-of-type(1) { top: 0px; transform-origin: left center; }
  .burger span:nth-of-type(2) { top: 50%; transform: translateY(-50%); transform-origin: left center; }
  .burger span:nth-of-type(3) { top: 100%; transform-origin: left center; transform: translateY(-100%); }
  .burger input:checked ~ span:nth-of-type(1) { transform: rotate(45deg); top: 0px; left: 5px; }
  .burger input:checked ~ span:nth-of-type(2) { width: 0%; opacity: 0; }
  .burger input:checked ~ span:nth-of-type(3) { transform: rotate(-45deg); top: 28px; left: 5px; }
`;

// Icons for the main menu buttons
const UploadIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>;
const ReviewIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ProfileIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

const MainMenu = ({ setActiveView, darkMode }) => (
  <div className="max-w-4xl mx-auto text-center">
    <h1 className={`text-4xl font-bold mb-12 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Teacher Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="button-wrap">
        <div className="button-shadow"></div>
        <button onClick={() => setActiveView('upload')}>
          <span>
            <div className="flex flex-col items-center justify-center p-4">
              <UploadIcon />
              <div className="text-xl font-semibold mt-2">Upload Files</div>
            </div>
          </span>
        </button>
      </div>
      <div className="button-wrap">
        <div className="button-shadow"></div>
        <button onClick={() => setActiveView('review')}>
          <span>
            <div className="flex flex-col items-center justify-center p-4">
              <ReviewIcon />
              <div className="text-xl font-semibold mt-2">Review Content</div>
            </div>
          </span>
        </button>
      </div>
      <div className="button-wrap">
        <div className="button-shadow"></div>
        <button onClick={() => setActiveView('profile')}>
          <span>
            <div className="flex flex-col items-center justify-center p-4">
              <ProfileIcon />
              <div className="text-xl font-semibold mt-2">Profile</div>
            </div>
          </span>
        </button>
      </div>
    </div>
  </div>
);


export default function TeacherDashboard() {
  const [activeView, setActiveView] = useState('menu');
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const reactiveBgRef = useRef(null);

  useEffect(() => {
    // Hide sidebar by default on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    const handleMouseMove = (event) => {
      if (reactiveBgRef.current) {
        const { clientX, clientY } = event;
        reactiveBgRef.current.style.setProperty('--mouse-x', `${clientX}px`);
        reactiveBgRef.current.style.setProperty('--mouse-y', `${clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return <UploadContent darkMode={darkMode} />;
      case 'review':
        return <ReviewContent darkMode={darkMode} />;
      case 'profile':
        return <ProfileContent darkMode={darkMode} />;
      case 'menu':
      default:
        return <MainMenu setActiveView={setActiveView} darkMode={darkMode} />;
    }
  };

  return (
    <>
      <style>{componentStylesCSS}</style>
      <div className={`relative min-h-screen transition-all duration-500 ${darkMode ? 'dark' : 'light'} ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-50"
        }`}>
          <div ref={reactiveBgRef} className="reactive-background"></div>
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30 animate-pulse ${
              darkMode ? "bg-purple-500/50" : "bg-purple-300"
            }`}></div>
            <div className={`absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-30 animate-pulse delay-1000 ${
              darkMode ? "bg-indigo-500/50" : "bg-indigo-300"
            }`}></div>
          </div>
          
          <label className="burger fixed top-5 left-5 z-50">
            <input type="checkbox" checked={isSidebarOpen} onChange={() => setIsSidebarOpen(!isSidebarOpen)} />
            <span></span>
            <span></span>
            <span></span>
          </label>

          <Sidebar 
            isSidebarOpen={isSidebarOpen}
            setActiveView={setActiveView} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />

          <main className={`relative z-10 p-6 md:p-12 h-screen overflow-y-auto flex items-center justify-center transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'md:pl-72' : 'md:pl-20'
          }`}>
              {renderContent()}
          </main>
      </div>
    </>
  );
}