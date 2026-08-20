import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ docId, speciality }) => {
  const { doctors } = useContext(AppContext);
  const [relDoc, setRelDoc] = useState([]);
  const navigate = useNavigate();

  //   we will display related doctor except the doctor whose profile on we are presently
  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId]);
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Related Specialists</h1>
      <p className="sm:w-1/2 text-center text-sm text-gray-500 leading-relaxed">
        Explore other highly recommended practitioners within the same speciality field.
      </p>
      <div className="w-full grid grid-cols-auto gap-6 pt-8 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointments/${item._id}`);
              scrollTo(0, 0);
            }}
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
      {/* scrollTo- redirect to the page at its top */}
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-teal-50/80 text-teal-700 font-semibold px-12 py-3.5 rounded-full mt-10 hover:bg-teal-100 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
      >
        View All Doctors
      </button>
    </div>
  );
};

export default RelatedDoctors;
