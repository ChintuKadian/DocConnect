import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";
import eyeopen from "../assets/eye-open.png";
import eyeclose from "../assets/eye-close.png";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const onSubmitHandler = async (event) => {
    event.preventDefault(); //so that it will not reload webpage
    try {
      if (state === "Admin") {
        // on form submission request is sent to  backend and data is receiced, if success then extract the token send by backend and store it
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token); //store token in local storage to stay loggin after reload
          setAToken(data.token);
        } else {
          // displaying  toast notification
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token); //store token in local storage to stay loggin after reload
          setDToken(data.token);
          console.log(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch {}
  };

  const changeType = () => {
    if (type === "text") {
      setType("password");
    } else {
      setType("text");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center"
    >
      <div className="flex flex-col gap-4 m-auto items-stretch p-8 sm:p-10 min-w-[340px] sm:min-w-[400px] bg-white border border-gray-100 rounded-2xl text-gray-600 text-sm shadow-xl shadow-teal-900/5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
            <span className="text-primary">{state}</span> Console
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 text-center">
            Sign in to access your administrative operations dashboard.
          </p>
        </div>

        <div className="w-full">
          <p className="font-semibold text-gray-700 text-xs">Email Address</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full border border-gray-200 rounded-xl p-2.5 mt-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p className="font-semibold text-gray-700 text-xs">Password</p>
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full border border-gray-200 rounded-xl p-2.5 pr-12 mt-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-505 transition-all"
              type={type}
              required
            />
            <img
              onClick={changeType}
              className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 w-5 h-5 cursor-pointer opacity-50 hover:opacity-85 transition-opacity"
              src={type === "text" ? eyeopen : eyeclose}
              alt=""
            />
          </div>
        </div>

        <button className="cursor-pointer bg-primary text-white w-full py-3 rounded-xl font-bold hover:shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 mt-2 text-center text-base">
          Sign In
        </button>

        <div className="text-center mt-2">
          {state === "Admin" ? (
            <p className="text-xs text-gray-500">
              Are you a doctor?{" "}
              <span
                className="cursor-pointer text-primary font-bold hover:underline"
                onClick={() => setState("Doctor")}
              >
                Doctor Sign In
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Are you an administrator?{" "}
              <span
                className="cursor-pointer text-primary font-bold hover:underline"
                onClick={() => setState("Admin")}
              >
                Admin Sign In
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
