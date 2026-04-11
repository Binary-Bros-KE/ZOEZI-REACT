import { useState } from "react"
import { motion } from "framer-motion"
import AdminLayout from "../AdminLayout/AdminLayout"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function AdminAdmissions() {
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    citizenship: "",
    idNumber: "",

    // Admission Info
    admissionNumber: "",

    // Education Info
    qualification: "",
    course: "",
    trainingMode: "",
    preferredIntake: "",
    preferredStartDate: "",
    startDate: "",
    kcseGrade: "",

    // Application History
    howHeardAbout: [],
    otherSource: "",

    // Finance
    courseFee: "",
    upfrontFee: "",
    feePayer: "",
    feePayerPhone: "",

    // Course Specific
    courseDuration: "",

    // Emergency Contact
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",
  })

  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [exams, setExams] = useState([])
  const [examInput, setExamInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
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

  const handleAddExam = () => {
    if (!examInput.trim()) {
      toast.error('Please enter exam name')
      return
    }
    setExams([...exams, { name: examInput, score: 0 }])
    setExamInput("")
  }

  const handleRemoveExam = (index) => {
    setExams(exams.filter((_, i) => i !== index))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name === "howHeardAbout") {
      setFormData((prev) => ({
        ...prev,
        howHeardAbout: checked ? [...prev.howHeardAbout, value] : prev.howHeardAbout.filter((item) => item !== value),
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setImagePreview(null)
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
    if (!formData.citizenship.trim()) newErrors.citizenship = "Citizenship is required"
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID/Passport number is required"
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = "Admission number is required"
    if (!formData.qualification) newErrors.qualification = "Highest qualification is required"
    if (!formData.course) newErrors.course = "Course is required"
    if (!formData.trainingMode) newErrors.trainingMode = "Training mode is required"
    if (!formData.preferredIntake) newErrors.preferredIntake = "Preferred intake is required"
    if (!formData.preferredStartDate) newErrors.preferredStartDate = "Preferred start date is required"
    if (!formData.kcseGrade.trim()) newErrors.kcseGrade = "KCSE grade is required"
    if (!formData.courseFee) newErrors.courseFee = "Course fee is required"
    if (!formData.upfrontFee) newErrors.upfrontFee = "Upfront fee is required"
    if (!formData.courseDuration.trim()) newErrors.courseDuration = "Course duration is required"
    if (exams.length === 0) newErrors.exams = "Please add at least one exam"
    if (!formData.feePayer.trim()) newErrors.feePayer = "Fee payer information is required"
    if (!formData.feePayerPhone.trim()) newErrors.feePayerPhone = "Fee payer phone is required"
    if (formData.howHeardAbout.length === 0) newErrors.howHeardAbout = "Please select how student heard about us"
    if (formData.howHeardAbout.includes("Other") && !formData.otherSource.trim()) {
      newErrors.otherSource = "Please specify the source"
    }
    if (!formData.nextOfKinName.trim()) newErrors.nextOfKinName = "Next of kin name is required"
    if (!formData.nextOfKinRelationship.trim()) newErrors.nextOfKinRelationship = "Next of kin relationship is required"
    if (!formData.nextOfKinPhone.trim()) newErrors.nextOfKinPhone = "Next of kin phone is required"

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

    setSubmitting(true)

    try {
      const fd = new FormData()

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "howHeardAbout" && Array.isArray(value)) {
          value.forEach(item => fd.append("howHeardAbout", item))
        } else if (value !== "" && value !== null && value !== undefined) {
          fd.append(key, value)
        }
      })

      // Append exams array
      exams.forEach((exam, index) => {
        fd.append(`exams[${index}][name]`, exam.name)
        fd.append(`exams[${index}][score]`, exam.score || 0)
      })

      // Append profile picture if selected
      if (file) {
        fd.append("profilePicture", file)
      }

      const res = await fetch(`${API_BASE_URL}/admissions`, { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Failed to create student")

      toast.success("Student created successfully!")

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        citizenship: "",
        idNumber: "",
        admissionNumber: "",
        qualification: "",
        course: "",
        trainingMode: "",
        preferredIntake: "",
        preferredStartDate: "",
        startDate: "",
        kcseGrade: "",
        howHeardAbout: [],
        otherSource: "",
        courseFee: "",
        upfrontFee: "",
        feePayer: "",
        feePayerPhone: "",
        courseDuration: "",
        nextOfKinName: "",
        nextOfKinRelationship: "",
        nextOfKinPhone: "",
      })
      setFile(null)
      setImagePreview(null)
      setExams([])
      setExamInput("")
      setErrors({})
    } catch (err) {
      console.error("Admissions error", err)
      toast.error("Failed to create student: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ minHeight: "100vh" }}>
        <div style={{ margin: "0 auto", padding: "0 1rem" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ marginBottom: "2rem" }}>
              <div className='flex gap-2'>
                <Link
                  className='bg-primary-gold text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-yellow transition-colors'
                  to="/admin/students">
                  Students
                </Link>
                <Link
                  className='bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors'
                  to="/admin/applications">
                  Applications
                </Link>
                <Link
                  className='bg-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors'
                  to="/admin/admissions">
                  Admissions
                </Link>
                <Link
                  className='bg-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors'
                  to="/admin/update-fee">
                  Update Fee
                </Link>
                <Link
                  className='bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors'
                  to="/admin/details">
                  Details
                </Link>
              </div>
              <h2 style={{ color: "#2b2520", fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                Manual Student Admissions
              </h2>
              <p style={{ color: "#666", fontSize: "1rem" }}>
                Fill in all required information to create a new student record in the system
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2.5rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}>
              {/* Personal Information */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  👤 Personal Information
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      First Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      style={{ width: "100%", padding: "0.75rem", border: errors.firstName ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.firstName ? "#d32f2f" : "#ddd"}
                    />
                    {errors.firstName && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.firstName}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Last Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      style={{ width: "100%", padding: "0.75rem", border: errors.lastName ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.lastName ? "#d32f2f" : "#ddd"}
                    />
                    {errors.lastName && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.lastName}</span>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Email <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      style={{ width: "100%", padding: "0.75rem", border: errors.email ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.email ? "#d32f2f" : "#ddd"}
                    />
                    {errors.email && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.email}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Phone Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254712345678"
                      style={{ width: "100%", padding: "0.75rem", border: errors.phone ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.phone ? "#d32f2f" : "#ddd"}
                    />
                    {errors.phone && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.phone}</span>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Date of Birth <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.dateOfBirth ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.dateOfBirth ? "#d32f2f" : "#ddd"}
                    />
                    {errors.dateOfBirth && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.dateOfBirth}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Gender <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.gender ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.gender ? "#d32f2f" : "#ddd"}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.gender}</span>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Citizenship <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleChange}
                      placeholder="e.g., Kenyan, Nigerian"
                      style={{ width: "100%", padding: "0.75rem", border: errors.citizenship ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.citizenship ? "#d32f2f" : "#ddd"}
                    />
                    {errors.citizenship && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.citizenship}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      ID / Passport Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder="ID or Passport number"
                      style={{ width: "100%", padding: "0.75rem", border: errors.idNumber ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.idNumber ? "#d32f2f" : "#ddd"}
                    />
                    {errors.idNumber && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.idNumber}</span>}
                  </div>
                </div>
              </div>

              {/* Admission Information */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  📋 Admission Information
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Admission Number <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleChange}
                      placeholder="e.g., ADM-2025-001"
                      style={{ width: "100%", padding: "0.75rem", border: errors.admissionNumber ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.admissionNumber ? "#d32f2f" : "#ddd"}
                    />
                    {errors.admissionNumber && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.admissionNumber}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Start Date (Actual) <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.startDate ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.startDate ? "#d32f2f" : "#ddd"}
                    />
                    {errors.startDate && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.startDate}</span>}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  🎓 Academic Information
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Highest Qualification <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.qualification ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.qualification ? "#d32f2f" : "#ddd"}
                    >
                      <option value="">Select Qualification</option>
                      <option value="kcse">KCSE</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                      <option value="masters">Masters</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.qualification && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.qualification}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      KCSE Grade or Equivalent <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="kcseGrade"
                      value={formData.kcseGrade}
                      onChange={handleChange}
                      placeholder="e.g., D+, C, A-"
                      style={{ width: "100%", padding: "0.75rem", border: errors.kcseGrade ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.kcseGrade ? "#d32f2f" : "#ddd"}
                    />
                    {errors.kcseGrade && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.kcseGrade}</span>}
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  📚 Course Information
                </h3>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                    Course <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "0.75rem", border: errors.course ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                    onBlur={(e) => e.target.style.borderColor = errors.course ? "#d32f2f" : "#ddd"}
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.course && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.course}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Preferred Intake Month <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <select
                      name="preferredIntake"
                      value={formData.preferredIntake}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.preferredIntake ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.preferredIntake ? "#d32f2f" : "#ddd"}
                    >
                      <option value="">Select Month</option>
                      {["January", "April", "July", "October"].map((month) => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    {errors.preferredIntake && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.preferredIntake}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Preferred Start Date <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="preferredStartDate"
                      value={formData.preferredStartDate}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "0.75rem", border: errors.preferredStartDate ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.preferredStartDate ? "#d32f2f" : "#ddd"}
                    />
                    {errors.preferredStartDate && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{errors.preferredStartDate}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.75rem" }}>
                    Mode of Training <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "2rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="trainingMode"
                        value="Physical"
                        checked={formData.trainingMode === "Physical"}
                        onChange={handleChange}
                      />
                      Physical Classes
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
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
                  {errors.trainingMode && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.trainingMode}</span>}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                    Course Duration <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="courseDuration"
                    value={formData.courseDuration}
                    onChange={handleChange}
                    placeholder="e.g., 3 months, 6 months, 1 year"
                    style={{ width: "100%", padding: "0.75rem", border: errors.courseDuration ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                    onBlur={(e) => e.target.style.borderColor = errors.courseDuration ? "#d32f2f" : "#ddd"}
                  />
                  {errors.courseDuration && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.courseDuration}</span>}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.75rem" }}>
                    Expected Exams <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                    <input
                      type="text"
                      value={examInput}
                      onChange={(e) => setExamInput(e.target.value)}
                      placeholder="Enter exam name (e.g., Practical, Written, Theory)"
                      style={{ flex: 1, padding: "0.75rem", border: "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem" }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddExam()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddExam}
                      style={{ padding: "0.75rem 1.5rem", background: "#d4a644", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Add
                    </button>
                  </div>
                  {exams.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                      {exams.map((exam, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            backgroundColor: "#f0f0f0",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #d4a644",
                            fontSize: "0.9rem"
                          }}
                        >
                          <span>{exam.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExam(idx)}
                            style={{ background: "none", border: "none", color: "#d32f2f", fontWeight: "bold", cursor: "pointer", fontSize: "1.2rem", padding: "0" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.exams && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.exams}</span>}
                </div>
              </div>

              {/* How Student Found Us */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  📢 How They Found Us
                </h3>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "1rem" }}>
                    How did they learn about NZI? <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                    {howHeardAboutOptions.map((option) => (
                      <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
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
                  {errors.howHeardAbout && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.5rem", display: "block" }}>{errors.howHeardAbout}</span>}
                </div>

                {formData.howHeardAbout.includes("Other") && (
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Please Specify
                    </label>
                    <input
                      type="text"
                      name="otherSource"
                      value={formData.otherSource}
                      onChange={handleChange}
                      placeholder="Please specify the source"
                      style={{ width: "100%", padding: "0.75rem", border: errors.otherSource ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.otherSource ? "#d32f2f" : "#ddd"}
                    />
                    {errors.otherSource && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.otherSource}</span>}
                  </div>
                )}
              </div>

              {/* Financial Information */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  💰 Financial Information
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Course Fee (Total) <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="courseFee"
                      value={formData.courseFee}
                      onChange={handleChange}
                      placeholder="0"
                      style={{ width: "100%", padding: "0.75rem", border: errors.courseFee ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.courseFee ? "#d32f2f" : "#ddd"}
                    />
                    {errors.courseFee && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.courseFee}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Upfront Fee <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="upfrontFee"
                      value={formData.upfrontFee}
                      onChange={handleChange}
                      placeholder="0"
                      style={{ width: "100%", padding: "0.75rem", border: errors.upfrontFee ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.upfrontFee ? "#d32f2f" : "#ddd"}
                    />
                    {errors.upfrontFee && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.upfrontFee}</span>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Who Will Pay the Fee? <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="feePayer"
                      value={formData.feePayer}
                      onChange={handleChange}
                      placeholder="e.g., Self, Parent, Employer"
                      style={{ width: "100%", padding: "0.75rem", border: errors.feePayer ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.feePayer ? "#d32f2f" : "#ddd"}
                    />
                    {errors.feePayer && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.feePayer}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Fee Payer Phone <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="feePayerPhone"
                      value={formData.feePayerPhone}
                      onChange={handleChange}
                      placeholder="+254712345678"
                      style={{ width: "100%", padding: "0.75rem", border: errors.feePayerPhone ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.feePayerPhone ? "#d32f2f" : "#ddd"}
                    />
                    {errors.feePayerPhone && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.feePayerPhone}</span>}
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  👨‍👩‍👧 Next of Kin
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Name <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nextOfKinName"
                      value={formData.nextOfKinName}
                      onChange={handleChange}
                      placeholder="Next of kin full name"
                      style={{ width: "100%", padding: "0.75rem", border: errors.nextOfKinName ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.nextOfKinName ? "#d32f2f" : "#ddd"}
                    />
                    {errors.nextOfKinName && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.nextOfKinName}</span>}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                      Relationship <span style={{ color: "#d4a644" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship}
                      onChange={handleChange}
                      placeholder="e.g., Mother, Father"
                      style={{ width: "100%", padding: "0.75rem", border: errors.nextOfKinRelationship ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                      onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                      onBlur={(e) => e.target.style.borderColor = errors.nextOfKinRelationship ? "#d32f2f" : "#ddd"}
                    />
                    {errors.nextOfKinRelationship && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.nextOfKinRelationship}</span>}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.5rem" }}>
                    Phone <span style={{ color: "#d4a644" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={handleChange}
                    placeholder="+254712345678"
                    style={{ width: "100%", padding: "0.75rem", border: errors.nextOfKinPhone ? "2px solid #d32f2f" : "2px solid #ddd", borderRadius: "8px", fontSize: "0.95rem", transition: "all 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#d4a644"}
                    onBlur={(e) => e.target.style.borderColor = errors.nextOfKinPhone ? "#d32f2f" : "#ddd"}
                  />
                  {errors.nextOfKinPhone && <span style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>{errors.nextOfKinPhone}</span>}
                </div>
              </div>

              {/* Profile Picture */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ color: "#2b2520", marginBottom: "1.5rem", borderBottom: "2px solid #d4a644", paddingBottom: "0.5rem", fontSize: "1.3rem", fontWeight: "600" }}>
                  📸 Profile Picture
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2b2520", marginBottom: "0.75rem" }}>
                      Upload Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ width: "100%", padding: "0.75rem", border: "2px dashed #d4a644", borderRadius: "8px", cursor: "pointer" }}
                    />
                    <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.5rem" }}>PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#2b2520", fontWeight: "600", marginBottom: "1rem" }}>Preview</p>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={{ width: "150px", height: "150px", borderRadius: "10px", objectFit: "cover", border: "3px solid #d4a644" }} />
                    ) : (
                      <div style={{ width: "150px", height: "150px", borderRadius: "10px", backgroundColor: "#f0f0f0", border: "2px dashed #d4a644", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: "3rem" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: submitting ? "#ccc" : "linear-gradient(135deg, #d4a644 0%, #c9952f 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "1rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.transform = "translateY(-2px)", e.target.style.boxShadow = "0 8px 20px rgba(212, 166, 68, 0.3)")}
                  onMouseLeave={(e) => !submitting && (e.target.style.transform = "translateY(0)", e.target.style.boxShadow = "none")}
                >
                  {submitting ? "Creating Student..." : "Create Student"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}

