import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="flex bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-800 rounded-2xl px-6 sm:px-10 md:px-14 my-20 md:mx-10 shadow-xl shadow-teal-900/5 relative overflow-hidden">
      {/* Abstract light shape */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl"></div>

      {/* left side */}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 relative z-10">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          <p>Book Appointment</p>
          <p className="mt-2 text-emerald-100">With 100+ Trusted Doctors</p>
        </div>
        <button
          onClick={() => {
            navigate("/login");
            scrollTo(0, 0);
          }}
          className="bg-white text-sm sm:text-base text-teal-700 font-bold py-3.5 rounded-full mt-8 px-10 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          Create Account
        </button>
      </div>

      {/* right side */}
      {/* hidden for small screen */}
      <div className="hidden md:block md:w-0.5 lg:w-[370px] relative">
        <img
          className="w-full absolute bottom-0 right-0 max-w-md"
          src={assets.appointment_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Banner;
