import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Search by Speciality</h1>
      <p className="sm:w-1/2 text-center text-sm text-gray-500 leading-relaxed">
        Select a medical department to explore our extensive listing of vetted specialists and schedule your consultation slots.
      </p>
      <div className="flex sm:justify-center gap-6 pt-8 w-full overflow-x-auto pb-4 scrollbar-thin">
        {specialityData.map((item, index) => (
          <Link onClick={()=>scrollTo(0,0)}
            className="flex flex-col items-center text-xs font-semibold text-gray-700 cursor-pointer shrink-0 p-4 w-24 sm:w-28 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-teal-50/30 hover:border-teal-100 hover:text-primary hover:shadow-sm hover:translate-y-[-6px] transition-all duration-300"
            key={index}
            to={`/doctors/${item.speciality}`}
          >
            <img className="w-12 sm:w-16 mb-3 object-contain hover:scale-105 transition-transform duration-300" src={item.image} alt="" />
            <p className="text-center leading-tight">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
