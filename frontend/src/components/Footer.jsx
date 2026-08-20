import React from "react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* left section */}
        <div>
          <Logo className="mb-5" />
          <p className="w-full md:w-2/3 text-gray-500 leading-6">
            DocConnect is a premium, secure healthcare appointment portal designed to streamline patient care, simplify doctor scheduling, and establish a modern ecosystem for medical management. Consult with trusted, top-tier medical specialists in your area.
          </p>
        </div>

        {/* centet section */}
        <div>
          <p className="text-sm font-bold text-gray-800 mb-5 tracking-wider uppercase">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li className="hover:text-primary cursor-pointer transition-colors">Home</li>
            <li className="hover:text-primary cursor-pointer transition-colors">About us</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Contact us</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
          </ul>
        </div>
        {/* right section */}
        <div>
          <p className="text-sm font-bold text-gray-800 mb-5 tracking-wider uppercase">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li>+12-444-888-00</li>
            <li>support@docconnect.co</li>
          </ul>
        </div>
      </div>

      {/* Copyright Text */}
      <div className="border-t border-gray-150 py-5">
        <p className="text-xs text-center text-gray-400">Copyright © 2026 DocConnect - All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
