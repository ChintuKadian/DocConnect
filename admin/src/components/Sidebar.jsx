import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <div className="min-h-screen bg-white border-r border-gray-200">
      {
        //if token available create ul
        aToken && (
          <ul className="text-gray-600 mt-5 space-y-1">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/admin-dashboard"}
            >
              <img className="w-5 h-5 opacity-70 group-hover:opacity-100" src={assets.home_icon} alt="" />
              <p className="hidden md:block">Dashboard</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/all-appointments"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.appointment_icon} alt="" />
              <p className="hidden md:block">Appointments</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/add-doctor"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.add_icon} alt="" />
              <p className="hidden md:block">Add Doctor</p>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/doctor-list"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Doctors List</p>
            </NavLink>
          </ul>
        )
      }
      {
        //if token available create ul
        dToken && (
          <ul className="text-gray-600 mt-5 space-y-1">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/doctor-dashboard"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.home_icon} alt="" />
              <p className="hidden md:block">Dashboard</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/doctor-appointments"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.appointment_icon} alt="" />
              <p className="hidden md:block">Appointments</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer font-medium transition-all duration-150 ${
                  isActive ? "bg-teal-50/50 text-teal-700 border-r-4 border-primary" : "hover:bg-slate-50/80"
                }`
              }
              to={"/doctor-profile"}
            >
              <img className="w-5 h-5 opacity-70" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Profile</p>
            </NavLink>
          </ul>
        )
      }
    </div>
  );
};

export default Sidebar;
