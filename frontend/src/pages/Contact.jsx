import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-primary font-bold'>US</span></p>
      </div>

      <div className='my-10 flex gap-12 flex-col justify-center md:flex-row mb-28 text-sm' >
        <img className='w-full max-w-[350px] rounded-2xl shadow-sm' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-bold text-lg text-gray-800 tracking-tight'>OUR OFFICE</p>
          <p className='text-gray-500 leading-relaxed'>54709 Willms Station <br />
          Suite 350, Washington, USA</p>
          <p className='text-gray-500 leading-relaxed'>Tel: (212)-999-000-88 <br /> Email: support@docconnect.co</p>
          <p className='font-bold text-lg text-gray-800 tracking-tight'>Careers at DOCCONNECT</p>
          <p className='text-gray-500 leading-relaxed'>Learn more about our teams and current job openings.</p>
          <button className='cursor-pointer border border-teal-600 text-teal-700 font-semibold px-8 py-3.5 rounded-full text-sm hover:bg-teal-600 hover:text-white hover:shadow-md transition-all duration-300 active:scale-95'>Explore Jobs</button>
        </div>
      </div>
      

    </div>
  )
}

export default Contact