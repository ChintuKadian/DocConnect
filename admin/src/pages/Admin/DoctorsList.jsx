import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const {doctors,aToken,getAllDoctors,changeAvailability,deleteDoctor}=useContext(AdminContext);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);

  useEffect(()=>{
    if(aToken){
      getAllDoctors()
    }

  },[aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll relative'>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((item,index)=>(
            <div className='border border-indigo-200 rounded-xl max-w-56 cursor-pointer group' key={index}>
              <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                <p className='text-zinc-600 text-sm'>{item.speciality}</p>
                <div className='mt-2 flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-1'>
                    <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                    <p>Available</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmDoc(item);
                    }}
                    className='text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer hover:underline'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {deleteConfirmDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900">Delete Doctor</h3>
            <p className="text-gray-500 text-sm mt-2">
              Are you sure you want to delete Dr. <span className="font-semibold text-gray-800">{deleteConfirmDoc.name}</span>? This action will permanently remove the record and delete their profile image from Cloudinary.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setDeleteConfirmDoc(null)} 
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                id="confirm-delete-btn"
                onClick={() => {
                  deleteDoctor(deleteConfirmDoc._id);
                  setDeleteConfirmDoc(null);
                }} 
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer hover:brightness-110 active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    
    </div>
  )
}

export default DoctorsList