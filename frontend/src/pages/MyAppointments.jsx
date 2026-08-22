import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, userData, loadUserProfileData } = useContext(AppContext);

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const months = [
    " ",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        // filter out cancelled appointments so they disappear from list
        const activeAppointments = data.appointments.filter(item => !item.cancelled);
        setAppointments(activeAppointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/google-auth", {
        headers: { token }
      });
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error(data.message || "Failed to connect Google Calendar.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      // console.log(appointmentId);
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        //get updated data
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };



  // eact item of appointment array has docData,userData,slotDate, slotTime, check for more in models

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  // Check URL parameters for successful oauth redirection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleAuth") === "success") {
      toast.success("Google Calendar Connected Successfully!");
      if (token) {
        loadUserProfileData();
      }
      navigate("/my-appointments", { replace: true });
    }
  }, [token]);

  return (
    <div>
      <p className="pt-3 mt-12 font-bold text-gray-900 border-b border-gray-100 pb-3 text-lg">
        My Appointments
      </p>

      {token && (
        <div className="bg-teal-50/40 border border-teal-100 rounded-2xl p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-teal-900 font-bold text-sm sm:text-base">
              {userData && userData.googleTokens ? "Google Calendar Synced" : "Sync with Google Calendar"}
            </h3>
            <p className="text-xs text-teal-700/80 mt-1">
              {userData && userData.googleTokens 
                ? "Your appointments will automatically synchronize and update directly in your Google Calendar."
                : "Get automatic schedule confirmations and reminders synced directly to your Google Calendar."}
            </p>
          </div>
          {userData && userData.googleTokens ? (
            <div className="bg-teal-600 text-white text-xs font-semibold px-6 py-3 rounded-full flex items-center gap-2 shrink-0">
              <span className="text-sm">✓</span> Connected
            </div>
          ) : (
            <button
              onClick={connectGoogleCalendar}
              className="bg-primary text-white text-xs font-semibold px-6 py-3 rounded-full hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              Connect Calendar
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-5 border-b border-gray-100 last:border-none"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-slate-50 border border-gray-100 rounded-xl object-cover"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-bold text-base">
                {item.docData.name}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{item.docData.speciality}</p>
              <p className="text-zinc-700 font-semibold mt-3 text-xs">Address:</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.docData.address.line1}</p>
              <p className="text-xs text-gray-500">{item.docData.address.line2}</p>
              <p className="text-sm mt-3 text-gray-700">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block sm:inline mr-1">
                  Date & Time:
                </span>
                <span className="font-semibold text-gray-900">{slotDateFormat(item.slotDate)}</span> at <span className="font-semibold text-gray-900">{item.slotTime}</span>
              </p>

              {item.symptoms && (
                <div className="mt-3 bg-zinc-50 rounded-xl p-3 border border-zinc-100 max-w-xl">
                  <p className="text-xs font-semibold text-zinc-700">Symptoms Shared:</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.symptoms}</p>
                  
                  {item.preVisitSummary && (
                    <div className="mt-2 pt-2 border-t border-zinc-200/50">
                      <p className="text-xs font-semibold text-zinc-700">AI Pre-Visit Assessment:</p>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.preVisitSummary.urgency === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                          item.preVisitSummary.urgency === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          Urgency: {item.preVisitSummary.urgency}
                        </span>
                        <span className="text-[11px] text-zinc-600 font-medium">
                          Complaint: {item.preVisitSummary.chiefComplaint}
                        </span>
                      </div>
                      {item.preVisitSummary.suggestedQuestions && item.preVisitSummary.suggestedQuestions.length > 0 && (
                        <div className="mt-2.5 pl-1">
                          <p className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Suggested Questions to Ask:</p>
                          <ul className="list-disc pl-4 text-xs text-zinc-500 mt-1 space-y-1">
                            {item.preVisitSummary.suggestedQuestions.map((q, idx) => (
                              <li key={idx} className="leading-relaxed">{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {item.isCompleted && (item.postVisitSummary || (item.prescription && item.prescription.length > 0)) && (
                <div className="mt-3 bg-teal-50/20 rounded-xl p-4 border border-teal-50 max-w-xl">
                  {item.postVisitSummary && (
                    <div>
                      <p className="text-xs font-bold text-teal-800 flex items-center gap-1">
                        <span>✨ AI Care Summary</span>
                      </p>
                      <p className="text-xs text-teal-700/90 mt-1 leading-relaxed">{item.postVisitSummary}</p>
                    </div>
                  )}
                  {item.prescription && item.prescription.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-teal-100/40">
                      <p className="text-xs font-semibold text-teal-850">Prescription Schedule:</p>
                      <ul className="list-disc pl-4 mt-1 text-xs text-teal-700/80 space-y-1">
                        {item.prescription.map((p, idx) => (
                          <li key={idx}>
                            <strong className="font-semibold">{p.medicationName || p.name}</strong> - {p.frequency || p.dosage} ({p.duration})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div></div>

            <div className="flex flex-col gap-2 justify-end sm:justify-center">
              {!item.cancelled && !item.isCompleted && (
                <span className="sm:min-w-48 py-2.5 text-center text-teal-700 bg-teal-50 border border-teal-100 rounded-xl font-bold text-sm">
                  Confirmed
                </span>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white border border-red-100 rounded-xl px-4 py-2.5 font-medium transition-all duration-200 active:scale-95 cursor-pointer text-center sm:min-w-48"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <span className="sm:min-w-48 py-2.5 text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium">
                  Appointment Cancelled
                </span>
              )}

              {
                item.isCompleted && <span className="sm:min-w-48 py-2.5 text-center text-teal-700 bg-teal-50 border border-teal-100 rounded-xl text-sm font-bold">Completed</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
