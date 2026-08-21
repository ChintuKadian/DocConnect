import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import Logo from "./Logo";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();
  const logout = () => {
    //set admin token to null for logout and remove it from local storage
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  };
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-200 bg-white">
      <Logo subtitle={aToken ? "Admin Console" : "Doctor Portal"} className="cursor-pointer" />
      <button
        onClick={logout}
        className="cursor-pointer bg-primary hover:brightness-110 active:scale-95 text-white text-sm py-2 px-8 rounded-full font-bold shadow-sm transition-all duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
