import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
const Doctors = () => {
  const { speciality } = useParams();
  // getting the parameter (type of doctor)
  // console.log(speciality);

  //displaying the doctor as per type of choice(filter)
  const [filterDoc, setFilterDoc] = useState([]);
  const [showfilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  //the below function will get executed whereeve any of doctors or speciality (dependencies ) gets changed
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  return (
    <div>
      <p className="text-gray-600 ">Browse through the doctors speciality.</p>
      <div className="flex flex-col gap-5 sm:flex-row items-start mt-5">
        <button
          className={`py-1 border rounded text-sm transition-all sm:hidden ${
            showfilter ? "bg-primary text-white" : ""
          } `}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          Filters
        </button>
        <div
          className={`flex-col gap-3.5 text-sm text-gray-600 min-w-48 ${
            showfilter ? "flex" : "hidden sm:flex"
          }`}
        >
          <p
            onClick={() =>
              speciality === "General physician"
                ? navigate("/doctors")
                : navigate("/doctors/General physician")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "General physician"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            General physician
          </p>
          <p
            onClick={() =>
              speciality === "Gynecologist"
                ? navigate("/doctors")
                : navigate("/doctors/Gynecologist")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "Gynecologist"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            Gynecologist
          </p>
          <p
            onClick={() =>
              speciality === "Dermatologist"
                ? navigate("/doctors")
                : navigate("/doctors/Dermatologist")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "Dermatologist"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            Dermatologist
          </p>
          <p
            onClick={() =>
              speciality === "Pediatricians"
                ? navigate("/doctors")
                : navigate("/doctors/Pediatricians")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "Pediatricians"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            Pediatricians
          </p>
          <p
            onClick={() =>
              speciality === "Neurologist"
                ? navigate("/doctors")
                : navigate("/doctors/Neurologist")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "Neurologist"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            Neurologist
          </p>
          <p
            onClick={() =>
              speciality === "Gastroenterologist"
                ? navigate("/doctors")
                : navigate("/doctors/Gastroenterologist")
            }
            className={`w-[94vw] sm:w-auto pl-4 py-2.5 pr-12 border rounded-xl transition-all cursor-pointer font-medium ${
              speciality === "Gastroenterologist"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "border-gray-200 hover:bg-slate-50"
            }`}
          >
            Gastroenterologist
          </p>
        </div>
        <div className="w-full grid grid-cols-auto gap-6">
          {filterDoc.map((item, index) => (
            <div
              onClick={() => { navigate(`/appointments/${item._id}`); scrollTo(0, 0); }}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200/80 hover:translate-y-[-6px] transition-all duration-300 cursor-pointer"
              key={index}
            >
              <div className="relative overflow-hidden bg-slate-50 aspect-square flex items-end justify-center">
                <img className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" src={item.image} alt="" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${item.available ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
                    {item.available ? "Available" : "Away"}
                  </span>
                </div>
                <p className="text-gray-900 text-base font-bold group-hover:text-primary transition-colors">{item.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
