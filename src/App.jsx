import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast';
import "./App.css"

import Navbar from "./components/Navbar/Navbar"
import Footer from "./components/Footer/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"

import Home from "./pages/Home/Home"
import WhoWeAre from "./pages/WhoWeAre/WhoWeAre"
import WhatWeDo from "./pages/WhatWeDo/WhatWeDo"
import ApplyNow from "./pages/ApplyNow/ApplyNow"
import Contact from "./pages/Contact/Contact"
import SearchMembers from "./pages/SearchMembers/SearchMembers"
import ProfileDetail from "./pages/ProfileDetail/ProfileDetail"

// Auth Pages
import Login from "./pages/Login/Login"
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSubscriptions from "./pages/Admin/Finance/AdminSubscriptions";
import AdminTutors from "./pages/Admin/Tutors/AdminTutors";
import AdminAssignments from "./pages/Admin/Assignments/AdminAssignments";
import AdminApplications from "./pages/Admin/Students/AdminApplications";
import AdminAdmissions from "./pages/Admin/Students/AdminAdmissions";
import AdminUpdateFee from "./pages/Admin/Students/AdminUpdateFee";
import AdminStudents from "./pages/Admin/Students/AdminStudents";
import AdminAlumni from "./pages/Admin/Alumni/AdminAlumni";
import AdminDetails from "./pages/Admin/Students/AdminDetails";

// User Pages
import UserDashboard from "./pages/UserDashboard/AlumniDash/UserDashboard"
import StudentDashboard from "./pages/UserDashboard/StudentDash/StudentDashboard"
import TutorDashboard from "./pages/UserDashboard/TutorDash/TutorDashboard"
import AlumniDashboard from "./pages/UserDashboard/AlumniDash/AlumniDashboard"
import AdminCourses from "./pages/Admin/courses/AdminCourses";
import AdminCurriculum from "./pages/Admin/courses/AdminCurriculum";
import AdminFinance from "./pages/Admin/Finance/AdminFinance";
import AlumniRegistration from "./pages/Alumni/AlumniRegistration";
import ElearningUsers from "./pages/Admin/Soma/ElearningUsers";
import SystemManagement from "./pages/Admin/SystemManagement/SystemManagement";
import AdminTrylist from "./pages/Admin/Trylist/AdminTrylist";
import PaymentResult from "./pages/Payment/PaymentResult";


function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" containerClassName='relative z-99999' />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/who-we-are" element={<WhoWeAre />} />
                  <Route path="/what-we-do" element={<WhatWeDo />} />
                  <Route path="/apply-now" element={<ApplyNow />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/search-members" element={<SearchMembers />} />
                  <Route path="/profile-detail" element={<ProfileDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/register" element={<AlumniRegistration />} />
                  <Route path="/payment/result" element={<PaymentResult />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/admissions" element={<AdminAdmissions />} />
        <Route path="/admin/update-fee" element={<AdminUpdateFee />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/tutors" element={<AdminTutors />} />
        <Route path="/admin/assignments" element={<AdminAssignments />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/curriculum" element={<AdminCurriculum />} />
        <Route path="/admin/alumni" element={<AdminAlumni />} />
        <Route path="/admin/details" element={<AdminDetails />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/settlements" element={<AdminFinance />} />
        <Route path="/admin/soma" element={<ElearningUsers />} />
        <Route path="/admin/trylist" element={<AdminTrylist />} />
        <Route path="/admin/system" element={<SystemManagement />} />

        {/* User Dashboards - Type-Specific Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni"
          element={
            <ProtectedRoute>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
