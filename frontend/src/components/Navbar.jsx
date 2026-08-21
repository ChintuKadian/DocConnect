import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Logo from "./Logo";

const Navbar = () => {
  // hidden is to hide tag in sm(phone) devices

  const navigate = useNavigate(); //hook to redirect to login page after clicking create account button

  const [showMenu, setShowMenu] = useState(false);
  // const [token, setToken] = useState(true); //token means logged in, it was temporary token used before created apis

  const {token,setToken,userData} =useContext(AppContext)

  const logout=()=>{
    setToken(false)
    localStorage.removeItem('token')
  }

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-200">
      <Logo onClick={() => navigate("/")} className="cursor-pointer" />
      <ul className="hidden md:flex items-start gap-5 font-semibold text-gray-600">
        <NavLink to="/">
          <li className="py-1 hover:text-primary transition-colors">HOME</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/doctors">
          <li className="py-1 hover:text-primary transition-colors">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/about">
          <li className="py-1 hover:text-primary transition-colors">ABOUT</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/contact">
          <li className="py-1 hover:text-primary transition-colors">CONTACT</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {
          token && userData ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 rounded-full border border-teal-200 shadow-sm"
                src={userData.image}
                alt=""
              />
              <img className="w-2.5" src={assets.dropdown_icon} alt="" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 shadow-md border border-gray-200">
                  <p
                    onClick={() => navigate("my-profile")}
                    className="hover:text-primary cursor-pointer transition-colors"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("my-appointments")}
                    className="hover:text-primary cursor-pointer transition-colors"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={logout}
                    className="hover:text-primary cursor-pointer transition-colors"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full font-medium hidden md:block hover:shadow-md hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              Create Account
            </button>
          )
          //show create account button only when token is false(log out)
        }
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt=""
        />
        {/* Mobile menu */}
        <div
          className={` ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6 border-b border-gray-100">
            <Logo onClick={() => { setShowMenu(false); navigate("/"); }} className="cursor-pointer" />
            <img
              className="w-7 cursor-pointer"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col text-center gap-2 mt-4 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Home</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
