import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const DoctorAppointment = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  // States for notes and prescription modal
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [newMed, setNewMed] = useState({ name: "", frequency: "", duration: "" });

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 px-6 py-3 border-b ">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6   border-b hover:bg-gray-100"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1} </p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name} </p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>
            </div>
            <p className="max-sm:hidden"> {calculateAge(item.userData.dob)} </p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}{" "}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className=" text-green-500 text-xs font-medium"> Completed </p>
            ) : (
              <div className="flex">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
                <img
                  onClick={() => setActiveAppointmentId(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clinical Notes & Prescription Modal */}
      {activeAppointmentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-150">
              <h3 className="text-lg font-bold text-gray-900">Complete Appointment & Add Prescription</h3>
              <button 
                onClick={() => { setActiveAppointmentId(null); setNotes(""); setPrescriptions([]); }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="overflow-y-auto py-4 flex-1 space-y-4">
              {/* Symptoms report from patient */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3">
                <p className="text-xs font-semibold text-zinc-700">Patient Symptom Report:</p>
                <p className="text-xs text-zinc-650 mt-1 leading-relaxed">
                  {appointments.find(a => a._id === activeAppointmentId)?.symptoms || "None shared."}
                </p>
                {appointments.find(a => a._id === activeAppointmentId)?.preVisitSummary && (
                  <div className="mt-2 pt-2 border-t border-zinc-200">
                    <p className="text-[11px] font-semibold text-zinc-700">AI Pre-Visit Assessment:</p>
                    <p className="text-xs text-zinc-650 mt-0.5">
                      <span className="font-semibold">Urgency:</span> {appointments.find(a => a._id === activeAppointmentId)?.preVisitSummary.urgency}
                    </p>
                    <p className="text-xs text-zinc-650 mt-0.5">
                      <span className="font-semibold">Chief Complaint:</span> {appointments.find(a => a._id === activeAppointmentId)?.preVisitSummary.chiefComplaint}
                    </p>
                  </div>
                )}
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Notes / Diagnosis:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter diagnosis, findings, or advice..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>
              
              {/* Prescriptions List */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Prescribed Medications:</label>
                
                {/* Inputs to add new medication */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. Twice daily)"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 5 days)"
                    value={newMed.duration}
                    onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMed.name) return toast.warn("Please enter medication name");
                      setPrescriptions([...prescriptions, newMed]);
                      setNewMed({ name: "", frequency: "", duration: "" });
                    }}
                    className="sm:col-span-3 bg-primary text-white text-xs font-semibold py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors"
                  >
                    Add Medication
                  </button>
                </div>
                
                {/* List of added medications */}
                {prescriptions.length > 0 ? (
                  <div className="mt-3 space-y-1.5">
                    {prescriptions.map((med, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-teal-50/30 border border-teal-100 rounded-lg p-2.5 text-xs">
                        <div>
                          <p className="font-bold text-teal-900">{med.name}</p>
                          <p className="text-teal-700 mt-0.5">{med.frequency} &bull; {med.duration}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2 italic text-center">No medications prescribed yet.</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-150">
              <button
                onClick={() => { setActiveAppointmentId(null); setNotes(""); setPrescriptions([]); }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await completeAppointment(activeAppointmentId, notes, prescriptions);
                  setActiveAppointmentId(null);
                  setNotes("");
                  setPrescriptions([]);
                }}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-teal-700 cursor-pointer"
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;
