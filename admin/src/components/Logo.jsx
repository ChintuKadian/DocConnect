import React from 'react';

const Logo = ({ className = "", subtitle = "Operations Portal" }) => {
  return (
    <div className={`flex items-center gap-2 font-sans select-none ${className}`}>
      {/* Premium pulsing cross SVG icon */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-teal-400 shadow-md shadow-teal-500/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="white"
          className="w-5 h-5 animate-pulse"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <div className="absolute inset-0 rounded-lg bg-teal-500 blur-sm opacity-20 -z-10 animate-ping"></div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-lg font-black tracking-tight leading-none bg-gradient-to-r from-teal-600 via-teal-700 to-teal-500 bg-clip-text text-transparent">
          DocConnect
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

export default Logo;
