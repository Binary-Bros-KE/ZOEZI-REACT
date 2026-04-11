"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import "./ApplyForm.css"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL
const currentYear = new Date().getFullYear()

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function ApplyNow() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    qualification: "",
    preferredIntake: "",
    course: "",
    citizenship: "",
    idNumber: "",
    howHeardAbout: [],
    otherSource: "",
    trainingMode: "",
    preferredStartDate: "",
    kcseGrade: "",
    feePayer: "",
    feePayerPhone: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",
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
        howHeardAbout: checked ? [...prev.howHeardAbout, value] : prev.howHeardAbout.filter((item) => item !== value),
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

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.qualification) newErrors.qualification = "Highest qualification is required"
    if (!formData.preferredIntake) newErrors.preferredIntake = "Preferred intake is required"
    if (!formData.course) newErrors.course = "Course selection is required"
    if (!formData.citizenship) newErrors.citizenship = "Citizenship is required"
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID/Passport number is required"
    if (formData.howHeardAbout.length === 0) newErrors.howHeardAbout = "Please select how you heard about us"
    if (formData.howHeardAbout.includes("Other") && !formData.otherSource.trim()) {
      newErrors.otherSource = "Please specify the source"
    }
    if (!formData.trainingMode) newErrors.trainingMode = "Training mode is required"
    if (!formData.preferredStartDate) newErrors.preferredStartDate = "Preferred start date is required"
    if (!formData.kcseGrade.trim()) newErrors.kcseGrade = "KCSE grade is required"
    if (!formData.feePayer.trim()) newErrors.feePayer = "Fee payer information is required"
    if (!formData.feePayerPhone.trim()) newErrors.feePayerPhone = "Fee payer phone is required"
    if (!formData.nextOfKinName.trim()) newErrors.nextOfKinName = "Next of kin name is required"
    if (!formData.nextOfKinRelationship.trim()) newErrors.nextOfKinRelationship = "Next of kin relationship is required"
    if (!formData.nextOfKinPhone.trim()) newErrors.nextOfKinPhone = "Next of kin phone is required"
    if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the rules and regulations"

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log("[v0] Application submitted successfully:", data)

      // Show success modal
      setShowSuccess(true)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        qualification: "",
        preferredIntake: "",
        course: "",
        citizenship: "",
        idNumber: "",
        howHeardAbout: [],
        otherSource: "",
        trainingMode: "",
        preferredStartDate: "",
        kcseGrade: "",
        feePayer: "",
        feePayerPhone: "",
        nextOfKinName: "",
        nextOfKinRelationship: "",
        nextOfKinPhone: "",
        agreedToTerms: false,
      })
      setErrors({})
    } catch (error) {
      console.error("[v0] Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="page">
        <div className="container apply-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-header">
              <h2 className="text-4xl font-bold border-b-2 border-[#d4a644] w-fit mx-auto pb-2 mb-2 max-md:text-xl">Apply Now</h2>
              <p className="section-subtitle">Join Nairobi Zoezi Institute</p>
            </div>

            <form className="apply-form" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Personal Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      First Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "input-error" : ""}
                    />
                    {errors.firstName && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.firstName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">
                      Last Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "input-error" : ""}
                    />
                    {errors.lastName && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "input-error" : ""}
                      placeholder="e.g., +254712345678"
                    />
                    {errors.phone && <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">
                      Date of Birth <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={errors.dateOfBirth ? "input-error" : ""}
                    />
                    {errors.dateOfBirth && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.dateOfBirth}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">
                      Gender <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={errors.gender ? "input-error" : ""}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.gender}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="citizenship">
                      Citizenship <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleChange}
                      className={errors.citizenship ? "input-error" : ""}
                      placeholder="e.g., Kenyan, Nigerian, etc."
                    />
                    {errors.citizenship && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.citizenship}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="idNumber">
                      ID / Passport Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className={errors.idNumber ? "input-error" : ""}
                    />
                    {errors.idNumber && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.idNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Academic Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="qualification">
                      Highest Qualification <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className={errors.qualification ? "input-error" : ""}
                    >
                      <option value="">Select Qualification</option>
                      <option value="kcse">KCSE</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                      <option value="masters">Masters</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.qualification && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.qualification}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="kcseGrade">
                      KCSE Grade or Equivalent <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="kcseGrade"
                      name="kcseGrade"
                      value={formData.kcseGrade}
                      onChange={handleChange}
                      className={errors.kcseGrade ? "input-error" : ""}
                      placeholder="e.g., D+, C, A-"
                    />
                    {errors.kcseGrade && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.kcseGrade}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Course & Intake Information */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Course & Intake Information
                </h3>

                <div className="form-group full-width">
                  <label htmlFor="course">
                    Course You're Applying For <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className={errors.course ? "input-error" : ""}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {errors.course && <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.course}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredIntake">
                      Preferred Intake Month <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      id="preferredIntake"
                      name="preferredIntake"
                      value={formData.preferredIntake}
                      onChange={handleChange}
                      className={errors.preferredIntake ? "input-error" : ""}
                    >
                      <option value="">Select Month</option>
                      {["January", "April", "July", "October"].map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    {errors.preferredIntake && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.preferredIntake}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="preferredStartDate">
                      Preferred Start Date <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="date"
                      id="preferredStartDate"
                      name="preferredStartDate"
                      value={formData.preferredStartDate}
                      onChange={handleChange}
                      className={errors.preferredStartDate ? "input-error" : ""}
                    />
                    {errors.preferredStartDate && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.preferredStartDate}</span>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>
                    Mode of Training <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="radio"
                        name="trainingMode"
                        value="Physical"
                        checked={formData.trainingMode === "Physical"}
                        onChange={handleChange}
                      />
                      Physical Classes
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="radio"
                        name="trainingMode"
                        value="Online"
                        checked={formData.trainingMode === "Online"}
                        onChange={handleChange}
                      />
                      Online Classes
                    </label>
                  </div>
                  {errors.trainingMode && (
                    <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.trainingMode}</span>
                  )}
                </div>
              </div>

              {/* How You Heard About Us */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  How You Found Us
                </h3>

                <div className="form-group full-width">
                  <label>
                    How did you learn about NZI? <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {howHeardAboutOptions.map((option) => (
                      <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="checkbox"
                          name="howHeardAbout"
                          value={option}
                          checked={formData.howHeardAbout.includes(option)}
                          onChange={handleChange}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {errors.howHeardAbout && (
                    <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.howHeardAbout}</span>
                  )}
                </div>

                {formData.howHeardAbout.includes("Other") && (
                  <div className="form-group full-width">
                    <label htmlFor="otherSource">Please Specify</label>
                    <input
                      type="text"
                      id="otherSource"
                      name="otherSource"
                      value={formData.otherSource}
                      onChange={handleChange}
                      className={errors.otherSource ? "input-error" : ""}
                      placeholder="Please specify the source"
                    />
                    {errors.otherSource && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.otherSource}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Information */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Financial Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="feePayer">
                      Who Will Pay Your Fee? <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="feePayer"
                      name="feePayer"
                      value={formData.feePayer}
                      onChange={handleChange}
                      className={errors.feePayer ? "input-error" : ""}
                      placeholder="e.g., Self, Parent, Employer"
                    />
                    {errors.feePayer && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.feePayer}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="feePayerPhone">
                      Fee Payer Phone Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="feePayerPhone"
                      name="feePayerPhone"
                      value={formData.feePayerPhone}
                      onChange={handleChange}
                      className={errors.feePayerPhone ? "input-error" : ""}
                    />
                    {errors.feePayerPhone && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.feePayerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: "#2b2520",
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #d4a644",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Next of Kin
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nextOfKinName">
                      Next of Kin Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nextOfKinName"
                      name="nextOfKinName"
                      value={formData.nextOfKinName}
                      onChange={handleChange}
                      className={errors.nextOfKinName ? "input-error" : ""}
                    />
                    {errors.nextOfKinName && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.nextOfKinName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="nextOfKinRelationship">
                      Relationship <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nextOfKinRelationship"
                      name="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship}
                      onChange={handleChange}
                      className={errors.nextOfKinRelationship ? "input-error" : ""}
                      placeholder="e.g., Mother, Father, Sibling"
                    />
                    {errors.nextOfKinRelationship && (
                      <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.nextOfKinRelationship}</span>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="nextOfKinPhone">
                    Next of Kin Phone <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="nextOfKinPhone"
                    name="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={handleChange}
                    className={errors.nextOfKinPhone ? "input-error" : ""}
                  />
                  {errors.nextOfKinPhone && (
                    <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>{errors.nextOfKinPhone}</span>
                  )}
                </div>
              </div>

              {/* Rules & Regulations */}
              <div
                style={{
                  marginBottom: "2rem",
                  background: "#f5f5f3",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  borderLeft: "4px solid #d4a644",
                }}
              >
                <h3 style={{ color: "#2b2520", marginBottom: "1rem" }}>Rules and Regulations</h3>
                <div
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#555",
                    marginBottom: "1rem",
                  }}
                >
                  <ol style={{ paddingLeft: "1.5rem" }}>
                    <li>Students must attend all classes and practicals, punctually and without exception.</li>
                    <li>All assignments must be done and submitted for evaluation and grading.</li>
                    <li>Students must avail themselves physically to sit for exams.</li>
                    <li>
                      Students must exhibit a high degree of discipline, morality, professionalism and adherence to the
                      culture of the Institution.
                    </li>
                    <li>
                      Students are expected to understand and promote the Institution's Philosophy/Mission, ideas and
                      culture.
                    </li>
                    <li>
                      For general decorum and health promotion in the Institution, no member of the NZI community will
                      be allowed to smoke or be drunk while within the Institution's premises.
                    </li>
                    <li>Tuition and any other fees must be paid as per the laid down regulations.</li>
                    <li>
                      Any fees payment default will result in suspension from class attendance/program suspension.
                    </li>
                    <li>
                      Mutual respect must be cultivated by all the parties and responsibilities within the entire NZI
                      Community.
                    </li>
                    <li>
                      The NZI management will provide an enabling environment and learning facilitation for academic and
                      professional success.
                    </li>
                    <li>
                      No student will be graduated if he/she has not: a) regularly attended all tuition and other
                      mandatory sessions, b) done, submitted and passed all tests/assignments/projects/research, c) paid
                      all college fees/dues.
                    </li>
                    <li>
                      I consent to the school photographing, recording, and using my image, voice, assignments, and course-related work for educational, promotional, and marketing purposes. This includes use on social media, websites, online platforms, and other official communication channels.
                      I understand that this may be done without further notice or compensation.
                    </li>
                  </ol>
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginTop: "1rem" }}>
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    style={{ marginTop: "0.25rem", width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ color: "#2b2520" }}>
                    I have read and accept to adhere to the rules and regulations{" "}
                    <span style={{ color: "#d4a644" }}>*</span>
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <span style={{ color: "#d32f2f", fontSize: "0.85rem", display: "block", marginTop: "0.5rem" }}>
                    {errors.agreedToTerms}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSuccess(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "3rem",
              textAlign: "center",
              maxWidth: "500px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              cursor: "default",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "3rem",
              }}
            >
              ✓
            </div>
            <h2 style={{ color: "#2b2520", marginBottom: "1rem", fontSize: "1.8rem" }}>
              Application Submitted Successfully!
            </h2>
            <p style={{ color: "#555", marginBottom: "2rem", lineHeight: "1.6", fontSize: "1.05rem" }}>
              Thank you for your application to Nairobi Zoezi Institute. Our team will review your application and get back to you as soon as possible.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#4caf50")}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
