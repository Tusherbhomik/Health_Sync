import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const BookAppointment = ({ patientId = 1 }) => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [schedules, setSchedules] = useState([]); // Store raw schedule data
  const [doctorHospitals, setDoctorHospitals] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const specialties = [
    "All Specialties",
    "Cardiologist",
    "Neurologist",
    "Pediatrician",
    "Dermatologist",
    "Orthopedic",
    "Psychiatrist",
  ];

  const appointmentTypes = [
    { value: "IN_PERSON", label: "In Person" },
    { value: "VIDEO", label: "Video Call" },
    { value: "PHONE", label: "Phone Call" },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedHospital("");
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("");
    setReasonForVisit("");
    setPatientName("");
    setBookingSuccess(false);
    setTimeSlots([]);
    setAvailableDates([]);
    setSchedules([]);
    setDoctorHospitals([]);
  };

  useEffect(() => {
    const fetchDoctorsAndHospitals = async () => {
      try {
        setLoading(true);
        const [doctorsResponse, hospitalsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/doctors`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/hospitals`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors");
        if (!hospitalsResponse.ok) throw new Error("Failed to fetch hospitals");

        const doctorsData = await doctorsResponse.json();
        console.log(doctorsData);
        const hospitalsData = await hospitalsResponse.json();
        console.log(hospitalsData);

        const transformedDoctors = doctorsData.map((doctor) => ({
          ...doctor,
          specialization: doctor.role || "General",
          experience: "5+ years",
          availability: "Mon-Fri, 9:00 AM - 5:00 PM",
          rating: 4.5,
          reviews: 50,
          location: "Hospital Complex",
          qualifications: ["MD", "Board Certified"],
          consultationFee: 150,
          image: "/api/placeholder/120/120",
          hospitals: hospitalsData.filter(
            (h) => doctor.hospitalIds?.includes(h.id) || []
          ),
        }));

        setDoctors(transformedDoctors);
        setHospitals(hospitalsData);
        setFilteredDoctors(transformedDoctors);
      } catch (err) {
        setError(err.message);
        setDoctors([]);
        setFilteredDoctors([]);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsAndHospitals();
  }, []);

  // New useEffect to handle hospital selection and update available dates
  useEffect(() => {
    if (selectedHospital && schedules.length > 0) {
      console.log("Hospital selected:", selectedHospital);
      console.log("Available schedules:", schedules);

      const availableDays = [
        ...new Set(
          schedules
            .filter((s) => s.hospitalId === parseInt(selectedHospital))
            .map((s) => s.dayOfWeek.toUpperCase())
        ),
      ];

      console.log("Available days for hospital:", availableDays);
      const dates = generateAvailableDates(availableDays);
      console.log(dates);
      setAvailableDates(dates);

      // Reset selected date and time when hospital changes
      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
    } else {
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
    }
  }, [selectedHospital, schedules]);

  const fuzzySearch = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((doctor) => {
      const name = doctor.name.toLowerCase();
      const email = doctor.email ? doctor.email.toLowerCase() : "";
      const specialization = doctor.specialization.toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        specialization.includes(term)
      );
    });
  };

  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = fuzzySearch(filtered, searchTerm);
    }

    if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.specialization.toLowerCase() ===
          selectedSpecialty.toLowerCase()
      );
    }

    if (selectedHospital) {
      filtered = filtered.filter((doctor) =>
        doctor.hospitals.some((h) => h.id === parseInt(selectedHospital))
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, selectedHospital, doctors]);

  const handleBookAppointment = async (doctor) => {
    try {
      console.log("Booking appointment for doctor:", doctor);
      setSelectedDoctor(doctor);
      setIsModalOpen(true);
      setBookingSuccess(false);

      // Reset all selections
      setSelectedHospital("");
      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
      setAvailableDates([]);
      setSchedules([]);

      const response = await fetch(
        `${API_BASE_URL}/schedules?doctorId=${doctor.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const scheduleData = await response.json();
      console.log("Schedule data received:", scheduleData);
      setSchedules(scheduleData);

      // Extract unique hospital IDs from schedules
      const uniqueHospitalIds = [
        ...new Set(scheduleData.map((item) => item.hospitalId)),
      ];
      
      let filteredHospitals = hospitals.filter((h) =>
        uniqueHospitalIds.includes(h.id)
      );
      
      // Fallback: If no schedules found, use doctor's associated hospitals
      if (filteredHospitals.length === 0 && doctor.hospitals) {
        console.log("No schedules found, using doctor's hospitals:", doctor.hospitals);
        filteredHospitals = doctor.hospitals;
      }
      
      setDoctorHospitals(filteredHospitals);
      console.log("Doctor hospitals set:", filteredHospitals);
      
      if (filteredHospitals.length === 0) {
        console.warn("No hospitals available for this doctor");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // const generateAvailableDates = (availableDays) => {
  //   const dates = [];
  //   const today = new Date("2025-07-29T04:42:00+06:00"); // Current date and time
  //   const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  //   for (
  //     let d = new Date(today);
  //     d <= oneMonthLater;
  //     d.setDate(d.getDate() + 1)
  //   ) {
  //     const dayName = d
  //       .toLocaleDateString("en-US", { weekday: "long" })
  //       .toUpperCase();
  //     if (availableDays.includes(dayName)) {
  //       console.log(dayName);
  //       dates.push(d.toISOString().split("T")[0]);
  //     }
  //   }
  //   return dates;
  // };

  const generateAvailableDates = (availableDays) => {
    const dates = [];
    const today = new Date(); // Use current date
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (let i = 0; i <= 30; i++) {
      const d = new Date(today); // fresh copy
      d.setDate(today.getDate() + i);

      // Use UTC so the day name doesn't shift due to local timezones
      const dayName = d
        .toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "UTC",
        })
        .toUpperCase();

      if (availableDays.includes(dayName)) {
        // Output date in YYYY-MM-DD format
        dates.push(d.toISOString().split("T")[0]);
      }
    }

    return dates;
  };

  // Fetch available timeslots
  const handleFetchTimeslots = async (selectedDate) => {
    setLoading(true);
    setError("");
    console.log("Hello world")
    console.log(selectedDate);
    console.log(selectedHospital);
    console.log(selectedDoctor);
    let vardata=null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/timeslots?doctorId=${selectedDoctor.id}&hospitalId=${selectedHospital}&date=${selectedDate}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timeslots");
      }

      const data = await response.json();
      setBookedSlots(data);
      console.log("Hello");
      console.log(data);
      vardata = data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return vardata;
  };

  const handleDateSelection = async (selectedDate) => {
    const bannedSlots = await handleFetchTimeslots(selectedDate);
    
    setSelectedDate(selectedDate);
    setSelectedTime("");

    if (selectedDate && schedules.length > 0 && selectedHospital) {
      const schedule = schedules.find(
        (s) =>
          s.hospitalId === parseInt(selectedHospital) &&
          s.dayOfWeek.toUpperCase() ===
            new Date(selectedDate)
              .toLocaleDateString("en-US", { weekday: "long" })
              .toUpperCase()
      );

      if (schedule) {
        const slots1 = schedule.timeSlots.split(",").map((slot) => {
          const [start, end] = slot.split("-");
          return {
            display: `${start} - ${end}`,
            value: `${start} - ${end}`,
            slotId: `${schedule.id}_${start}`,
          };
        });
        const slots = slots1.filter(
            timeslot => !bannedSlots.includes(timeslot.value)
        );
        console.log("Goku");
        console.log(slots);

        // Filter out past slots for today
        const selectedDateObj = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDateObj.setHours(0, 0, 0, 0);
        
        if (selectedDateObj.getTime() === today.getTime()) {
          // If selecting today, filter out past time slots
          const now = new Date();
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
          
          setTimeSlots(slots.filter((slot) => {
            const slotStart = slot.value.split(' - ')[0];
            return slotStart >= currentTime;
          }));
        } else {
          setTimeSlots(slots);
        }
      } else {
        setTimeSlots([]);
      }
    } else {
      setTimeSlots([]);
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      const selectedSlotData = timeSlots.find(
        (slot) => slot.value === selectedTime
      );

      if (!selectedSlotData) throw new Error("Please select a valid time slot");

      console.log("Booking appointment with data:");
      console.log("Selected Time:", selectedTime);
      console.log("Selected Date:", selectedDate);
      console.log("Selected Slot Data:", selectedSlotData);

      const appointmentData = {
        patientId: patientId,
        doctorId: selectedDoctor.id,
        hospitalId: parseInt(selectedHospital),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime.split(' - ')[0], // Extract start time from "09:00 AM - 10:00 AM"
        type: appointmentType,
        reason: reasonForVisit,
        dateandtime: selectedTime,
      };
      console.log("Appointment Data:", appointmentData);

      const response = await fetch(`${API_BASE_URL}/appointments/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to book appointment");
      }
      
      const result = await response.json();
      console.log("Appointment booked successfully:", result);

      setBookingSuccess(true);
      alert("Appointment booked successfully!");
      setTimeout(() => handleCloseModal(), 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Book an Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule a consultation with our doctors
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctors by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>
              <select
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={selectedHospital || ""}
                onChange={(e) => setSelectedHospital(e.target.value)}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredDoctors.length} doctor
            {filteredDoctors.length !== 1 ? "s" : ""}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedSpecialty &&
              selectedSpecialty !== "All Specialties" &&
              ` in ${selectedSpecialty}`}
            {selectedHospital &&
              ` at ${
                hospitals.find((h) => h.id === parseInt(selectedHospital))?.name
              }`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  No doctors found matching your criteria
                </p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                      <span className="text-2xl text-blue-600 font-medium">
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg dark:text-gray-100">{doctor.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {doctor.specialization}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(doctor.rating)}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          {doctor.rating} ({doctor.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>{doctor.availability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                      <span>30 min consultation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span>{doctor.location}</span>
                    </div>
                    {doctor.email && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consultation Fee</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      ${doctor.consultationFee}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex-1"
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      Book Now
                    </button>
                    <button className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1">
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {bookingSuccess ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">
                      Appointment Request Successfully Sent!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Your appointment with {selectedDoctor?.name} has been
                      successfully requested.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-left">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Date:</strong> {selectedDate}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Time:</strong> {selectedTime}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Type:</strong>{" "}
                        {
                          appointmentTypes.find(
                            (t) => t.value === appointmentType
                          )?.label
                        }
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Doctor:</strong> {selectedDoctor?.name}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Patient:</strong> {patientName}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Hospital:</strong>{" "}
                        {
                          doctorHospitals.find(
                            (h) => h.id === parseInt(selectedHospital)
                          )?.name
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-semibold dark:text-gray-100">
                        Book Appointment
                      </h2>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <X className="w-5 h-5 dark:text-gray-400" />
                      </button>
                    </div>
                    {selectedDoctor && (
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {selectedDoctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-gray-100">
                              {selectedDoctor.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedDoctor.specialization}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              ${selectedDoctor.consultationFee}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Hospital
                        </label>
                        <select
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={selectedHospital || ""}
                          onChange={(e) => setSelectedHospital(e.target.value)}
                        >
                          <option value="">Select Hospital</option>
                          {doctorHospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Date
                        </label>
                        <select
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={selectedDate}
                          onChange={(e) => handleDateSelection(e.target.value)}
                          disabled={!selectedHospital}
                        >
                          <option value="">
                            {!selectedHospital
                              ? "Select a hospital first"
                              : availableDates.length === 0
                              ? "No available dates"
                              : "Select a date"}
                          </option>
                          {availableDates.map((date) => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedDate && timeSlots.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Time
                          </label>
                          <select
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                          >
                            <option value="">Select a time</option>
                            {timeSlots.map((slot, index) => (
                              <option key={index} value={slot.display}>
                                {slot.display}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {selectedDate && timeSlots.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-gray-400">
                            No available time slots for the selected date
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Appointment Type
                        </label>
                        <select
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={appointmentType}
                          onChange={(e) => setAppointmentType(e.target.value)}
                        >
                          <option value="">Choose appointment type</option>
                          {appointmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reason for Visit
                        </label>
                        <textarea
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          placeholder="Please describe your symptoms or reason for visit..."
                          value={reasonForVisit}
                          onChange={(e) => setReasonForVisit(e.target.value)}
                        />
                      </div>
                      {(!selectedHospital || !selectedDate || !selectedTime || !appointmentType || !reasonForVisit) && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          {!selectedHospital && "Please select a hospital. "}
                          {!selectedDate && "Please select a date. "}
                          {!selectedTime && "Please select a time. "}
                          {!appointmentType && "Please select appointment type. "}
                          {!reasonForVisit && "Please provide reason for visit. "}
                        </div>
                      )}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
                          onClick={handleCloseModal}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={handleSubmitBooking}
                          disabled={
                            isSubmitting ||
                            !selectedDate ||
                            !selectedTime ||
                            !appointmentType ||
                            !reasonForVisit ||
                            !selectedHospital
                          }
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Booking...
                            </div>
                          ) : (
                            "Confirm Booking"
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BookAppointment;
