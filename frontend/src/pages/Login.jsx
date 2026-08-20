import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import eyeopen from "../assets/eye-open.png";
import eyeclose from "../assets/eye-close.png";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign Up");
  const [type, setType] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          password,
          email,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          password,
          email,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeType=()=>{
    if(type==="text"){
      setType("password")
    }else{
      setType("text")
    }
  }
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-4 m-auto items-stretch p-8 sm:p-10 min-w-[340px] sm:min-w-[400px] bg-white border border-gray-100 rounded-2xl text-gray-600 text-sm shadow-xl shadow-teal-900/5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {state === "Sign Up" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5">
            Please {state === "Sign Up" ? "register" : "log in"} to schedule appointment slots.
          </p>
        </div>

        {state === "Sign Up" && (
          <div className="w-full">
            <p className="font-semibold text-gray-700 text-xs">Full Name</p>
            <input
              className="w-full border border-gray-200 rounded-xl p-2.5 mt-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-505 transition-all"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="font-semibold text-gray-700 text-xs">Email Address</p>
          <input
            className="w-full border border-gray-200 rounded-xl p-2.5 mt-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-505 transition-all"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className="w-full">
          <p className="font-semibold text-gray-700 text-xs">Password</p>
          <div className="relative">
            <input
              className="w-full border border-gray-200 rounded-xl p-2.5 pr-12 mt-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-505 transition-all"
              type={type}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
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

        <button
          type="submit"
          className="cursor-pointer bg-primary text-white w-full py-3 rounded-xl font-bold hover:shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 mt-2 text-center"
        >
          {state === "Sign Up" ? "Get Started" : "Sign In"}
        </button>

        <div className="text-center mt-2">
          {state === "Sign Up" ? (
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              New to DocConnect?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Create an account
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
