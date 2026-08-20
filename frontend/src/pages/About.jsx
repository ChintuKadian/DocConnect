import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          About <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full max-w-[350px] "
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            Welcome to DocConnect, your trusted partner in managing your
            healthcare needs conveniently and efficiently. At DocConnect, we
            understand the challenges individuals face when it comes to
            scheduling doctor appointments and managing their health records.
          </p>
          <p>
            DocConnect is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior
            service. Whether you're booking your first appointment or managing
            ongoing care, DocConnect is here to support you every step of the
            way.
          </p>
          <b className="  text-gray-800">Our Vision</b>
          <p>
            Our vision at DocConnect is to create a seamless healthcare
            experience for every user. We aim to bridge the gap between patients
            and healthcare providers, making it easier for you to access the
            care you need, when you need it.
          </p>
        </div>
      </div>

      <div>
        <p className="text-xl font-bold text-gray-800 my-6 tracking-tight">
          WHY <span className="text-primary font-extrabold">CHOOSE US</span>{" "}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-20">
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-8 py-10 flex flex-col gap-4 text-sm text-gray-500 shadow-sm hover:border-teal-200 hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
          <b className="text-gray-800 text-base">Efficiency:</b>
          <p className="leading-relaxed">
            Streamlined appointment scheduling that integrates seamlessly into your busy lifestyle.
          </p>
        </div>

        <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-8 py-10 flex flex-col gap-4 text-sm text-gray-500 shadow-sm hover:border-teal-200 hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
          <b className="text-gray-800 text-base">Convenience:</b>
          <p className="leading-relaxed">
            Access to a broad network of vetted healthcare specialists available in your area.
          </p>
        </div>

        <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-8 py-10 flex flex-col gap-4 text-sm text-gray-500 shadow-sm hover:border-teal-200 hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
          <b className="text-gray-800 text-base">Personalization:</b>
          <p className="leading-relaxed">
            Tailored consultation recommendations and health tracking reminders to support your wellbeing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
