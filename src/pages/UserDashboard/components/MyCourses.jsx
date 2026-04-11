import React, { useEffect, useState } from 'react'
import { FaClock, FaBook, FaTimes, FaRegCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import MpesaPayment from '../../../components/MpesaPayment'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_SERVER_URL

export default function MyCourses({ userData, setUserData, refreshUserData }) {
  const navigate = useNavigate()
  const [available, setAvailable] = useState([])
  const [enrolled, setEnrolled] = useState(() => userData?.courses || [])
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({ isPaid: false, courseName: '' })
  const userType = localStorage.getItem('userType')

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // First fetch enrolled courses
        await fetchEnrolledCourses();
        // Then fetch available courses
        await fetchAvailableCourses();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [userData?._id]);

  const fetchEnrolledCourses = async () => {
    if (!userData?._id) return
    try {
      const res = await fetch(`${API_BASE}/users/${userData._id}/courses?userType=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch enrolled courses')
      setEnrolled(data.data || [])
    } catch (err) {
      console.error('Failed to load enrolled courses', err)
    }
  }

  const fetchAvailableCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/courses?courseType=online&limit=100&status=active`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');

      const courses = data.data?.courses || data.data || [];

      // Get fresh enrolled data from the server
      const enrolledRes = await fetch(`${API_BASE}/users/${userData._id}/courses?userType=${userType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const enrolledData = await enrolledRes.json();
      const currentEnrolled = enrolledData.data || enrolled;

      // Use the fresh enrolled data for filtering
      const enrolledIds = new Set(
        currentEnrolled
          .filter(Boolean)
          .map(c => {
            const id = c.courseId?._id || c._id || c.courseId;
            return id ? String(id) : null;
          })
          .filter(id => id && id !== 'undefined' && id !== 'null')
      );


      // Filter out courses that user is already enrolled in
      const filtered = courses.filter(c => !enrolledIds.has(String(c._id)));

      setAvailable(filtered);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch and auto-assign curriculum for a course
  const assignCurriculumToCourse = async (courseId) => {
    try {
      // Fetch curriculums and find the one for this course
      const res = await fetch(`${API_BASE}/curriculums`);
      const data = await res.json();
      
      if (data.status === 'success') {
        const curriculum = data.data.curriculums?.find(c => String(c.courseId) === String(courseId));
        if (curriculum) {
          return curriculum._id;
        }
      }
      return null;
    } catch (err) {
      console.error('Fetch curriculum error:', err);
      return null;
    }
  };

  const openEnroll = (course) => {
    setSelectedCourse(course)
    
    // Check if course is free (amount is 0 or undefined/null)
    const courseAmount = course.offerPrice || course.courseFee || 0;
    
    if (courseAmount === 0) {
      // If free, directly enroll without showing M-Pesa modal
      handleFreeEnrollment(course);
    } else {
      // If paid, show the M-Pesa modal
      setShowModal(true);
    }
  }

  const handleFreeEnrollment = async (course) => {
    try {
      // Create fake payment data for free courses
      const fakePaymentData = {
        amount: 0,
        transactionId: `FREE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        checkoutRequestId: `FREE-${Date.now()}`,
        phone: userData?.phone || "0712345678", // Use user's phone or default
        timeOfPayment: new Date().toISOString(),
        status: "PAID" // Mark as paid even though it's free
      };

      // Get curriculum for this course
      const curriculumId = await assignCurriculumToCourse(course._id);

      const res = await fetch(`${API_BASE}/users/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: userData._id,
          courseId: course._id,
          paymentData: fakePaymentData,
          userType: userType,
          curriculumId: curriculumId, // Add curriculum to enrollment
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Enrollment failed');

      // Refresh user data FIRST - this updates the sidebar
      if (refreshUserData) {
        const updatedUser = await refreshUserData();

        if (updatedUser?.courses) {
          // Update the enrolled state with refreshed courses
          setEnrolled(updatedUser.courses);

          // Now fetch fresh available courses with the updated enrolled state
          await fetchAvailableCourses();
        }
      } else {
        // Fallback: refresh both lists
        await fetchEnrolledCourses();
        await fetchAvailableCourses();
      }

      setSuccessData({ isPaid: false, courseName: course.name });
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Free enrollment error:', err);
      toast.error('Enrollment failed: ' + err.message);
    }
  };

  const handleEnrollSuccess = () => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Get curriculum for this course
      const curriculumId = await assignCurriculumToCourse(selectedCourse._id);

      const res = await fetch(`${API_BASE}/users/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: userData._id,
          courseId: selectedCourse._id,
          paymentData: paymentData,
          userType: userType,
          curriculumId: curriculumId, // Add curriculum to enrollment
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Enrollment failed');

      // Refresh user data FIRST - this updates the sidebar
      if (refreshUserData) {
        const updatedUser = await refreshUserData();

        if (updatedUser?.courses) {
          // Update the enrolled state with refreshed courses
          setEnrolled(updatedUser.courses);

          // Now fetch fresh available courses with the updated enrolled state
          await fetchAvailableCourses();
        }
      } else {
        // Fallback: refresh both lists
        await fetchEnrolledCourses();
        await fetchAvailableCourses();
      }

      setShowModal(false);
      setSuccessData({ isPaid: true, courseName: selectedCourse.name });
      setShowSuccessModal(true);
      setSelectedCourse(null);

    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error('Enrollment failed: ' + err.message);
    }
  };

  // Helper function to format course price display
  const formatCoursePrice = (course) => {
    const courseAmount = course.offerPrice || course.courseFee || 0;
    
    if (courseAmount === 0) {
      return <span className="font-bold text-green-600">FREE</span>;
    }
    
    if (course.offerPrice && course.offerPrice < course.courseFee) {
      return (
        <>
          <span className="line-through text-light text-xs">KES {course.courseFee?.toLocaleString()}</span>
          <span className="font-bold text-brand-gold ml-2">KES {course.offerPrice?.toLocaleString()}</span>
        </>
      );
    }
    
    return <span className="font-bold text-brand-gold">KES {courseAmount?.toLocaleString()}</span>;
  };

  // Helper function to format enrolled course payment amount
  const formatPaymentAmount = (amount) => {
    if (amount === 0 || amount === '0') {
      return <span className="font-semibold text-green-600">FREE</span>;
    }
    return <span className="font-semibold">KES {amount?.toLocaleString() || 'N/A'}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Enrolled Courses Section */}
      <section>
        <h3 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <FaBook className="text-brand-gold" /> My Enrolled Courses
        </h3>
        {enrolled && enrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolled.filter(Boolean).map((c) => {
              // Extract course info properly
              const courseData = c.courseId || c;
              const paymentData = c.payment || {};
              const tutorData = c.tutor;

              console.log('Course Data:', courseData);

              return (
                <div
                  key={c._id}
                  className="border-2 border-brand-gold rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white"
                >
                  {/* Course Image */}
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
                    {c.coverImage?.url ? (
                      <img
                        src={c.coverImage.url}
                        alt={c.name || 'Course'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-yellow flex items-center justify-center">
                        <FaBook className="text-white text-4xl" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h5 className="font-bold text-lg text-brand-dark mb-2 line-clamp-2">
                      {courseData.name || c.name || 'Untitled Course'}
                    </h5>

                    <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                      <FaClock className="text-brand-gold" />
                      <span>{courseData.duration || c.duration || '-'} {courseData.durationType || c.durationType || ''}</span>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-secondary font-semibold mb-1">Payment Details</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          {formatPaymentAmount(paymentData.amount)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span>{paymentData.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono">{paymentData.transactionId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${paymentData.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : paymentData.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {paymentData.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tutor Assignment */}
                    <div className="mb-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-secondary font-semibold mb-1">Tutor Assignment</p>
                      {tutorData?.status === 'ASSIGNED' && tutorData?.name ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-semibold">{tutorData.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{tutorData.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{tutorData.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ASSIGNED
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600 text-xs">⏳ Pending Assignment</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-light">
                      Enrolled: {new Date(c.enrolledAt || Date.now()).toLocaleDateString()}
                    </p>

                    {/* Access Course Content Button - if user type is alumni, url should be /alumni/*/}

                    { localStorage.getItem('userType') === 'alumni' ? (
                      <button
                      onClick={() => navigate(`/alumni/dashboard?tab=course-${c.courseId._id || c.courseId}`)}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"
                    >
                      ACCESS COURSE CONTENT
                    </button>
                    ) : (
                      <button
                      onClick={() => navigate(`/student/dashboard?tab=course-${c.courseId._id || c.courseId}`)}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"
                    >
                      ACCESS COURSE CONTENT
                    </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
            <FaBook className="text-brand-gold text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-lg">You have not enrolled in any courses yet.</p>
            <p className="text-light text-sm mt-2">Browse available courses below to get started!</p>
          </div>
        )}
      </section>

      {/* Available Courses Section */}
      <section>
        <h3 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <FaBook className="text-brand-gold" /> Available Online Courses
        </h3>
        {loading ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
            <div className="inline-block">
              <div className="w-10 h-10 border-4 rounded-full animate-spin border-gray-200 border-t-brand-gold"></div>
            </div>
            <p className="text-secondary text-lg mt-4">Loading courses...</p>
          </div>
        ) : available && available.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((course) => {
              const courseAmount = course.offerPrice || course.courseFee || 0;
              const isFree = courseAmount === 0;
              
              return (
                <div
                  key={course._id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand-gold transition-all duration-300 bg-white flex flex-col"
                >
                  {/* Course Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {course.coverImage?.url ? (
                      <img
                        src={course.coverImage.url}
                        alt={course.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-yellow flex items-center justify-center">
                        <FaBook className="text-white text-5xl opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFree ? 'bg-green-500 text-white' : 'bg-brand-gold text-white'}`}>
                        {isFree ? 'FREE' : 'Online'}
                      </span>
                    </div>
                    {isFree && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                          FREE COURSE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h5 className="font-bold text-lg text-primary mb-2 line-clamp-2">{course.name}</h5>
                    <p className="text-sm text-secondary mb-3 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-secondary mb-3 mt-auto">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-brand-gold" />
                        <span>{course.duration} {course.durationType}</span>
                      </div>
                      <div className="text-right">
                        {formatCoursePrice(course)}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openEnroll(course)}
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors border-2 mt-4 cursor-pointer ${
                        isFree 
                          ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                          : 'bg-brand-gold text-white border-brand-gold hover:bg-brand-yellow'
                      }`}
                    >
                      {isFree ? 'Enroll for FREE' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
            <FaBook className="text-brand-gold text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-lg">No online courses available at the moment.</p>
            <p className="text-light text-sm mt-2">Check back soon for new courses!</p>
          </div>
        )}
      </section>

      {showModal && selectedCourse && userData && (
        <MpesaPayment
          amount={selectedCourse.offerPrice || selectedCourse.courseFee}
          userId={userData._id}
          onClose={() => {
            setShowModal(false)
            setSelectedCourse(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <EnrollmentSuccessModal
          onClose={() => setShowSuccessModal(false)}
          isPaid={successData.isPaid}
          courseName={successData.courseName}
        />
      )}
    </div>
  )
}

// Success Modal Component
function EnrollmentSuccessModal({ onClose, isPaid, courseName }) {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-9999 transition-opacity duration-300 h-full"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 flex items-start justify-between border-b-4 border-purple-700">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {isPaid ? 'Payment Successful!' : 'Enrollment Successful!'}
              </h2>
              <p className="text-purple-100 text-sm sm:text-base flex items-center gap-2">
                You now have access to course content
                <FaRegCheckCircle />
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <p className="text-secondary text-base sm:text-lg font-semibold mb-2">
                {isPaid
                  ? `Your payment for "${courseName}" has been processed successfully.`
                  : `You have been enrolled in "${courseName}" successfully.`}
              </p>
              <p className="text-secondary text-sm sm:text-base">
                {isPaid
                  ? 'Your spot in the course is now secured. You have instant access to all course content.'
                  : 'You have instant access to all course content. Check under the MY COURSES tab for a new tab with the course name to view all materials and get started.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-300 text-brand-dark font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}