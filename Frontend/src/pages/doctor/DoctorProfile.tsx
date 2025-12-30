import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, Camera, Trash2, Upload, Edit, MapPin, Calendar, Award, User, Briefcase, Clock, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

interface DoctorProfileData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  birthDate?: string;
  gender?: string;
  profileImage?: string;
  institute?: string;
  licenseNumber?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DoctorProfile = () => {
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch doctor profile");
      }
      const data = await response.json();
      setDoctorInfo(data);
      console.log(data);
      
      if (data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsImageLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/image/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      const data = await response.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageUpdate = async (file: File) => {
    if (!file) return;
    
    setIsImageLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/image/update`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update image");
      }
      
      const data = await response.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
    } catch (err) {
      console.error("Error updating image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setIsImageLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
      
      setImage('');
      setShowImageActions(false);
    } catch (err) {
      console.error("Error deleting image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (image) {
        handleImageUpdate(file);
      } else {
        handleImageUpload(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 p-6 text-white shadow-lg">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Doctor Profile</h1>
                <p className="text-blue-100 dark:text-blue-200 text-sm">Manage your professional information with ease</p>
              </div>
              
              <Link
                to="/doctor/profile/edit"
                className="group relative overflow-hidden rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </div>
              </Link>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Enhanced Profile Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Profile Header Section */}
            <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Enhanced Profile Image Section */}
                <div className="relative group">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-800 transition-all duration-300 group-hover:scale-105">
                      {isImageLoading ? (
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : image ? (
                        <img 
                          src={image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-white font-bold">
                          {doctorInfo?.name?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced Image Actions Button */}
                    <button
                      onClick={() => setShowImageActions(!showImageActions)}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:scale-110"
                      disabled={isImageLoading}
                    >
                      <Camera className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    </button>

                    {/* Enhanced Image Actions Dropdown */}
                    {showImageActions && (
                      <div className="absolute top-full right-0 mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 min-w-48 z-10">
                        <button
                          onClick={triggerFileInput}
                          className="w-full px-5 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-all duration-200 text-gray-700 dark:text-gray-300"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="font-medium">{image ? 'Update Photo' : 'Upload Photo'}</span>
                        </button>
                        {image && (
                          <button
                            onClick={handleImageDelete}
                            className="w-full px-5 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Remove Photo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Enhanced Profile Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{doctorInfo?.name || 'Doctor'}</h2>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium">
                        <Briefcase className="w-3 h-3 mr-1.5" />
                        {doctorInfo?.specialization || 'GENERAL'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                        <Award className="w-3 h-3 mr-1.5" />
                        License: {doctorInfo?.licenseNumber || 'NOT_SET'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">5+ Years</p>
                        </div>
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Patients</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">500+</p>
                        </div>
                        <User className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">4.9/5</p>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Information */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Institute</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.institute || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Birth Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.birthDate ? new Date(doctorInfo.birthDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doctorInfo?.birthDate ? new Date().getFullYear() - new Date(doctorInfo.birthDate).getFullYear() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sections Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Enhanced Bio Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Professional Bio
              </h3>
              <div className="prose prose-gray dark:prose-invert">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {doctorInfo?.name ? `Dr. ${doctorInfo.name} is a dedicated ${doctorInfo.specialization} specialist with extensive experience at ${doctorInfo.institute}. Committed to providing exceptional patient care and staying current with the latest medical advances.` : 'Professional bio will be displayed here once profile information is complete.'}
                </p>
              </div>
            </div>

            {/* Enhanced Certifications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500 dark:text-green-400" />
                Certifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Medical License</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">License Number: {doctorInfo?.licenseNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Specialization Certificate</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Certified in {doctorInfo?.specialization || 'General Practice'} since 2020</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Availability Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Availability Schedule
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Weekdays</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Monday - Friday</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Weekends</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Saturday - Sunday</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">By appointment only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close dropdown */}
      {showImageActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowImageActions(false)}
        />
      )}
    </MainLayout>
  );
};

export default DoctorProfile;