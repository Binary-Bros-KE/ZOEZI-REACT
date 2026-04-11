import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaDownload, FaCheckCircle, FaClock, FaTimes, FaSpinner } from 'react-icons/fa'

const StudentCertifications = ({ userData }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [downloadingCourseId, setDownloadingCourseId] = useState(null)
  const API = import.meta.env.VITE_SERVER_URL
  const userType = localStorage.getItem('userType')

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })

  useEffect(() => {
    fetchFreshCourseData()
  }, [])

  const fetchFreshCourseData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API}/users/profile?userType=${userType}`, {
        headers: authHeader()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch fresh course data')
      }
      
      const data = await response.json()
      if (data.data?.courses) {
        setCourses(data.data.courses)
      }
    } catch (err) {
      console.error('Fetch fresh course data error:', err)
      toast.error('Failed to load certifications')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async (course) => {
    const id = course.courseId || course._id || course.id
    try {
      setDownloadingCourseId(id)
      // Load pdf-lib dynamically
      const { PDFDocument, rgb } = await import('pdf-lib')

      // Template PDF URL - Replace this with your actual certificate template PDF URL
      const CERTIFICATE_TEMPLATE_URL = '/NZI-CERT.pdf'

      // Fetch the existing certificate template
      const existingPdfBytes = await fetch(CERTIFICATE_TEMPLATE_URL).then(res => res.arrayBuffer())

      // Load the PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes)

      // Get the first page
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      // Get page dimensions (landscape)
      const { width, height } = firstPage.getSize()

      // Student name
      const studentName = `${userData?.firstName} ${userData?.lastName}`

      // Draw text in the center of the page
      // Landscape: width is larger, so center horizontally and position vertically in middle
      firstPage.drawText(studentName, {
        x: width / 2 - (studentName.length * 7.5), // Center horizontally (rough estimate, adjust as needed)
        y: height / 2 + (studentName.length * 2), // Center vertically
        size: 28,
        color: rgb(0.17, 0.15, 0.13), // Dark brown color (43, 37, 32 converted to 0-1 range)
        font: await pdfDoc.embedFont('Helvetica-Bold') // Use embedded font
      })

      // Save the PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${userData?.firstName}_${course.name}_Certificate.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Certificate downloaded successfully!')
    } catch (err) {
      console.error('Certificate download error:', err)
      toast.error('Failed to download certificate. Please try again.')
    } finally {
      setDownloadingCourseId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'GRADUATED':
      case 'CERTIFIED':
        return 'bg-green-50 border-green-200'
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'GRADUATED':
      case 'CERTIFIED':
        return (
          <span className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            <FaCheckCircle /> ✨ Certified
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            <FaClock /> In Progress
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Paid</span>
      case 'PENDING':
        return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⏳ Pending</span>
      case 'FAILED':
        return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">✗ Failed</span>
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Unknown</span>
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading certifications...</div>
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <h1 className="font-bold text-3xl text-primary-dark mb-6">📜 My Certifications</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaTimes size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No courses enrolled yet. Enroll in a course to see certifications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 pb-25">
      <div>
        <h1 className="font-bold text-3xl md:text-4xl text-primary-dark">📜 My Certifications</h1>
        <p className="text-gray-600 mt-2">Track your course progress, payment status, and download certificates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => {
          const isCertified = course.certificationStatus === 'GRADUATED' || course.certificationStatus === 'CERTIFIED'
          const completionPercentage = course.completionPercentage || 0
          const paymentStatus = course.payment?.status || 'PENDING'

          return (
            <div
              key={course.courseId}
              className={`rounded-lg shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${getStatusColor(
                course.certificationStatus
              )}`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-gold to-accent-orange p-4 text-white">
                <h2 className="font-bold text-xl">{course.name}</h2>
                <p className="text-sm opacity-90 mt-1">Tutor: {course.tutor?.firstName || 'Not assigned'}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Status</span>
                  {getStatusBadge(course.certificationStatus)}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                    <span className="text-sm font-bold text-primary-gold">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-gold to-accent-orange h-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                <div className="flex justify-between items-center py-3 border-t border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Payment Status</span>
                  {getPaymentBadge(paymentStatus)}
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-sm font-semibold text-gray-700">Amount</span>
                  Ksh {course.payment.amount}
                </div>
                </div>

                {/* Exams */}
                <div className="py-3 border-t border-gray-300">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Exams Recorded</div>
                  {course.exams && course.exams.length > 0 ? (
                    <div className="space-y-2">
                      {course.exams.map((exam, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{exam.examName}</span>
                          <span
                            className={`px-3 py-1 rounded font-bold ${
                              exam.grade === 'Distinction'
                                ? 'bg-green-100 text-green-800'
                                : exam.grade === 'Merit'
                                ? 'bg-blue-100 text-blue-800'
                                : exam.grade === 'Credit'
                                ? 'bg-amber-100 text-amber-800'
                                : exam.grade === 'Pass'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {exam.grade}
                          </span>
                        </div>
                      ))}
                      <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between text-sm font-bold">
                        <span className="text-gray-700">GPA:</span>
                        <span className="text-primary-gold">{course.gpa || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No exams recorded yet</p>
                  )}
                </div>

                {/* Certification Details */}
                {isCertified && (
                  <div className="py-3 border-t border-gray-300 bg-green-50 rounded p-3">
                    <div className="text-sm font-bold text-green-800 mb-2">✨ Certification Achieved!</div>
                    <div className="space-y-1 text-xs text-green-700">
                      <p>
                        <strong>Final Grade:</strong> {course.finalGrade}
                      </p>
                      <p>
                        <strong>Certified On:</strong>{' '}
                        {new Date(course.certificationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Download Certificate Button */}
                {isCertified && (
                  <button
                    onClick={() => downloadCertificate(course)}
                    disabled={downloadingCourseId === (course.courseId || course._id || course.id)}
                    className={`w-full bg-gradient-to-r from-primary-gold to-accent-orange hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-md ${
                      downloadingCourseId === (course.courseId || course._id || course.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {downloadingCourseId === (course.courseId || course._id || course.id) ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaDownload size={16} />
                        Download Certificate
                      </>
                    )}
                  </button>
                )}

                {/* Not Certified Yet */}
                {!isCertified && (
                  <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="font-semibold mb-1">📋 Not Yet Certified</p>
                    <p>
                      Complete all course requirements and pass all exams to earn your certificate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StudentCertifications
