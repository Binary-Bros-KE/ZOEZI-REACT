"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import SuccessModal from "../../components/SuccessModal"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function AlumniRegistration() {
  const navigate = useNavigate()
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    admnNumber: "",

    // Education Info (For school records only - not public)
    qualification: "",
    course: "",
    trainingMode: "",
    preferredIntake: "",
    preferredStartDate: "",
    startDate: "",
    citizenship: "",
    idNumber: "",
    kcseGrade: "",

    // How You Heard About Us
    howHeardAbout: [],
    otherSource: "",

    // Financial Information
    feePayer: "",
    feePayerPhone: "",

    // Next of Kin
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",

    // Professional Information (Public Profile)
    graduationDate: "",
    currentLocation: "",
    bio: "",
    practiceStatus: "active",

    // Terms
    agreedToTerms: false,
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const courses = [
    "Diploma in Fitness Science",
    "Certificate in Sports Nutrition",
    "Certificate in Spin",
    "Certificate in Yoga",
    "Certificate in Aqua Aerobics",
    "Certificate in Step Aerobics",
    "Certificate in Sports Massage",
    "Certificate in Personal Training",
  ]

  const howHeardAboutOptions = ["Instagram", "Facebook", "Tiktok", "Through a friend", "Other"]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name === "howHeardAbout") {
      setFormData((prev) => ({
        ...prev,
        howHeardAbout: checked
          ? [...prev.howHeardAbout, value]
          : prev.howHeardAbout.filter((item) => item !== value),
      }))
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic Information
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"

    // Education Info
    if (!formData.qualification) newErrors.qualification = "Highest qualification is required"
    if (!formData.course) newErrors.course = "Course selection is required"
    if (!formData.admnNumber) newErrors.admnNumber = "Admission Number is required"
    if (!formData.citizenship) newErrors.citizenship = "Citizenship is required"
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID/Passport number is required"
    if (!formData.kcseGrade.trim()) newErrors.kcseGrade = "Highest education score is required"

    // How You Heard
    if (formData.howHeardAbout.length === 0) newErrors.howHeardAbout = "Please select how you heard about us"
    if (formData.howHeardAbout.includes("Other") && !formData.otherSource.trim()) {
      newErrors.otherSource = "Please specify the source"
    }

    // Training Info
    if (!formData.trainingMode) newErrors.trainingMode = "Training mode is required"
    if (!formData.graduationDate) newErrors.graduationDate = "Graduation date is required"

    // Financial
    if (!formData.feePayer.trim()) newErrors.feePayer = "Fee payer information is required"
    if (!formData.feePayerPhone.trim()) newErrors.feePayerPhone = "Fee payer phone is required"

    // Next of Kin
    if (!formData.nextOfKinName.trim()) newErrors.nextOfKinName = "Next of kin name is required"
    if (!formData.nextOfKinRelationship.trim()) newErrors.nextOfKinRelationship = "Next of kin relationship is required"
    if (!formData.nextOfKinPhone.trim()) newErrors.nextOfKinPhone = "Next of kin phone is required"

    // Terms
    if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the rules and regulations"

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the errors in form before subsmission");
      return
    }

    setIsLoading(true)

    try {
      // Remove confirmPassword from submission
      const { confirmPassword, ...submitData } = formData

      const response = await fetch(`${API_BASE_URL}/alumni/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      console.log(`server response`, response);

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log("Alumni registration successful:", data)

      // Show success modal
      setShowSuccess(true)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        gender: "",
        qualification: "",
        course: "",
        trainingMode: "",
        preferredIntake: "",
        preferredStartDate: "",
        startDate: "",
        citizenship: "",
        idNumber: "",
        kcseGrade: "",
        admnNumber: "",
        howHeardAbout: [],
        otherSource: "",
        feePayer: "",
        feePayerPhone: "",
        nextOfKinName: "",
        nextOfKinRelationship: "",
        nextOfKinPhone: "",
        graduationDate: "",
        currentLocation: "",
        bio: "",
        practiceStatus: "active",
        agreedToTerms: false,
      })
      setErrors({})

      toast.success("Alumni registration successful!")

    } catch (error) {
      console.error("Error registering alumni:", error)
      toast.error(error.message || "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2b2520] to-[#3a332d] px-8 py-6">
              <h2 className="text-3xl font-bold text-white text-center">
                Alumni Account Registration
              </h2>
              <p className="text-gray-200 text-center mt-2">
                Register as a certified graduate of Nairobi Zoezi Institute
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Account Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#d4a644]">
                  Account Information
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your alumni account credentials
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="+254712345678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-[#d4a644]">*</span>
                    </label>
                    <div className={`flex items-center w-full pr-2 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.password ? "border-red-500" : "border-gray-300"
                      }`}>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 outline-none border-none"
                        placeholder="Minimum 6 characters"
                      />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                        {showLoginPassword ? (<FaRegEye />) : (<FaRegEyeSlash />)}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-[#d4a644]">*</span>
                    </label>
                    <div className={`flex items-center w-full pr-2 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                         className="w-full px-4 py-3 outline-none border-none"
                        placeholder="Re-enter your password"
                      />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                        {showLoginPassword ? (<FaRegEye />) : (<FaRegEyeSlash />)}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-[#d4a644]">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.gender ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Education Information - School Records Only */}
              <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Education Information
                </h3>
                <p className="text-gray-600 mb-4 text-sm italic">
                  Some of this information is for school records only and will not be displayed on your public profile
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Qualification */}
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Qualification <span className="text-[#d4a644]">*</span>
                    </label>
                    <select
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.qualification ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Qualification</option>
                      <option value="kcse">KCSE</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                      <option value="masters">Masters</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.qualification && (
                      <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                    )}
                  </div>

                  {/* Course */}
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Completed at NZI <span className="text-[#d4a644]">*</span>
                    </label>
                    <select
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.course ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {errors.course && (
                      <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                    )}
                  </div>

                  {/* Citizenship */}
                  <div>
                    <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700 mb-1">
                      Citizenship <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.citizenship ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., Kenyan"
                    />
                    {errors.citizenship && (
                      <p className="mt-1 text-sm text-red-600">{errors.citizenship}</p>
                    )}
                  </div>

                  {/* ID Number */}
                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      ID/Passport Number <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.idNumber ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., 12345678"
                    />
                    {errors.idNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
                    )}
                  </div>

                  {/* Education Score */}
                  <div>
                    <label htmlFor="kcseGrade" className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Education Score <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="kcseGrade"
                      name="kcseGrade"
                      value={formData.kcseGrade}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.kcseGrade ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., KCSE: A, Diploma: Distinction"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter your highest education score (e.g., KCSE: A-, Diploma: Distinction)
                    </p>
                    {errors.kcseGrade && (
                      <p className="mt-1 text-sm text-red-600">{errors.kcseGrade}</p>
                    )}
                  </div>

                  {/* Training Mode has to be a dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Mode <span className="text-[#d4a644]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="trainingMode"
                          value="Physical"
                          checked={formData.trainingMode === "Physical"}
                          onChange={handleChange}
                          className="h-4 w-4 text-[#d4a644] border-gray-300 focus:ring-[#d4a644]"
                        />
                        <span className="ml-2 text-gray-700">Physical Classes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="trainingMode"
                          value="hybrid"
                          checked={formData.trainingMode === "hybrid"}
                          onChange={handleChange}
                          className="h-4 w-4 text-[#d4a644] border-gray-300 focus:ring-[#d4a644]"
                        />
                        <span className="ml-2 text-gray-700">Hybrid</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="trainingMode"
                          value="Online"
                          checked={formData.trainingMode === "Online"}
                          onChange={handleChange}
                          className="h-4 w-4 text-[#d4a644] border-gray-300 focus:ring-[#d4a644]"
                        />
                        <span className="ml-2 text-gray-700">Online Classes</span>
                      </label>
                    </div>
                    {errors.trainingMode && (
                      <p className="mt-1 text-sm text-red-600">{errors.trainingMode}</p>
                    )}
                  </div>

                  {/* Admn Number */}
                  <div>
                    <label htmlFor="admnNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Admission Number <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="admnNumber"
                      name="admnNumber"
                      value={formData.admnNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.citizenship ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., DFS-001-25"
                    />
                    {errors.admnNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.admnNumber}</p>
                    )}
                  </div>

                  {/* Graduation Date */}
                  <div>
                    <label htmlFor="graduationDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Date <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="date"
                      id="graduationDate"
                      name="graduationDate"
                      value={formData.graduationDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.graduationDate ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.graduationDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.graduationDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* How You Heard About Us */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#d4a644]">
                  How You Found Us
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about NZI? <span className="text-[#d4a644]">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {howHeardAboutOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            name="howHeardAbout"
                            value={option}
                            checked={formData.howHeardAbout.includes(option)}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#d4a644] border-gray-300 rounded focus:ring-[#d4a644]"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.howHeardAbout && (
                      <p className="mt-1 text-sm text-red-600">{errors.howHeardAbout}</p>
                    )}
                  </div>

                  {formData.howHeardAbout.includes("Other") && (
                    <div>
                      <label htmlFor="otherSource" className="block text-sm font-medium text-gray-700 mb-1">
                        Please Specify
                      </label>
                      <input
                        type="text"
                        id="otherSource"
                        name="otherSource"
                        value={formData.otherSource}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.otherSource ? "border-red-500" : "border-gray-300"
                          }`}
                        placeholder="Please specify the source"
                      />
                      {errors.otherSource && (
                        <p className="mt-1 text-sm text-red-600">{errors.otherSource}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Professional Information
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  This information may appear on your public profile to help potential clients discover you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Location */}
                  <div>
                    <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Location
                    </label>
                    <input
                      type="text"
                      id="currentLocation"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition"
                      placeholder="e.g., Nairobi, Kenya"
                    />
                  </div>

                  {/* Practice Status */}
                  <div>
                    <label htmlFor="practiceStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Practice Status
                    </label>
                    <select
                      id="practiceStatus"
                      name="practiceStatus"
                      value={formData.practiceStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition resize-none"
                      placeholder="Brief description of your professional experience..."
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#d4a644]">
                  Financial Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fee Payer */}
                  <div>
                    <label htmlFor="feePayer" className="block text-sm font-medium text-gray-700 mb-1">
                      Who paid/will pay your fees? <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="feePayer"
                      name="feePayer"
                      value={formData.feePayer}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.feePayer ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., Self, Parent, Employer"
                    />
                    {errors.feePayer && (
                      <p className="mt-1 text-sm text-red-600">{errors.feePayer}</p>
                    )}
                  </div>

                  {/* Fee Payer Phone */}
                  <div>
                    <label htmlFor="feePayerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Payer Phone <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="feePayerPhone"
                      name="feePayerPhone"
                      value={formData.feePayerPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.feePayerPhone ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="+254712345678"
                    />
                    {errors.feePayerPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.feePayerPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#d4a644]">
                  Next of Kin
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Next of Kin Name */}
                  <div>
                    <label htmlFor="nextOfKinName" className="block text-sm font-medium text-gray-700 mb-1">
                      Next of Kin Name <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="nextOfKinName"
                      name="nextOfKinName"
                      value={formData.nextOfKinName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.nextOfKinName ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Full name"
                    />
                    {errors.nextOfKinName && (
                      <p className="mt-1 text-sm text-red-600">{errors.nextOfKinName}</p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div>
                    <label htmlFor="nextOfKinRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="text"
                      id="nextOfKinRelationship"
                      name="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.nextOfKinRelationship ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="e.g., Mother, Father, Spouse"
                    />
                    {errors.nextOfKinRelationship && (
                      <p className="mt-1 text-sm text-red-600">{errors.nextOfKinRelationship}</p>
                    )}
                  </div>

                  {/* Next of Kin Phone */}
                  <div className="md:col-span-2">
                    <label htmlFor="nextOfKinPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Next of Kin Phone <span className="text-[#d4a644]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="nextOfKinPhone"
                      name="nextOfKinPhone"
                      value={formData.nextOfKinPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d4a644] focus:border-[#d4a644] outline-none transition ${errors.nextOfKinPhone ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="+254712345678"
                    />
                    {errors.nextOfKinPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.nextOfKinPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Rules and Regulations
                </h3>

                <div className="space-y-3 text-gray-600 mb-4">
                  <p>By registering as an alumni, you agree to:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Maintain professional conduct as a representative of NZI</li>
                    <li>Keep your contact information updated</li>
                    <li>Adhere to professional ethics in your practice</li>
                    <li>Participate in continuing professional development when required</li>
                    <li>Respect the privacy and confidentiality of the alumni network</li>
                  </ul>
                  <p>Your Account Will not be approved if Admin Discovers any misleading information</p>
                </div>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="h-5 w-5 text-[#d4a644] border-gray-300 rounded focus:ring-[#d4a644] mt-1"
                  />
                  <span className="text-gray-700">
                    I have read and agree to abide by the rules and regulations of Nairobi Zoezi Institute{" "}
                    <span className="text-[#d4a644]">*</span>
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="mt-2 text-sm text-red-600">{errors.agreedToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full md:w-auto px-8 py-4 text-lg font-semibold text-white rounded-lg transition-all duration-300 ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#d4a644] to-[#b38d38] hover:from-[#b38d38] hover:to-[#94752d] shadow-lg hover:shadow-xl"
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Register as Alumni"
                  )}
                </button>

                <p className="mt-4 text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[#d4a644] hover:text-[#b38d38] font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          onClose={() => {
            setShowSuccess(false)
            navigate("/login")
          }}
          title="Registration Successful!"
          message="Your alumni account has been created successfully. You can now login with your credentials."
        />
      )}
    </>
  )
}