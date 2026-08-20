import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 rounded-2xl px-6 md:px-10 lg:px-20 shadow-xl shadow-teal-900/5 relative overflow-hidden">
      {/* Background abstract glowing shapes to look ultra-premium */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl -z-0"></div>

      {/* Left side */}
      <div className="md:w:1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px] z-10">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight md:leading-tight lg:leading-tight tracking-tight">
          Find & Book Consultation <br className="hidden sm:block" /> With Top-Tier Specialists
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-emerald-50 text-sm font-normal">
          <img className="w-28 opacity-95" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of vetted doctors,{". "}
            <br className="hidden sm:block" />
            secure your appointment slot hassle-free in minutes.
          </p>
        </div>
        <a
          href="#speciality"
          className="flex items-center gap-2.5 bg-white text-teal-700 font-semibold px-8 py-3.5 rounded-full text-sm m-auto md:m-0 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Book Appointment
          <img className="w-3 transform translate-x-0 group-hover:translate-x-1 transition-transform" src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* right side */}
      <div className="md:w-1/2 relative z-10">
        <img
          className="w-full md:absolute bottom-0 right-0 rounded-lg object-contain max-h-[90%] md:max-h-full"
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Header;
