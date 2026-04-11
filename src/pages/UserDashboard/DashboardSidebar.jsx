import { FaUser, FaCog, FaEye, FaWallet, FaSignOutAlt, FaBars, FaTimes, FaAward, FaUsers, FaSwatchbook, FaGraduationCap, FaMoneyBillWave, FaBook } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TbTableImport } from 'react-icons/tb'
import { MdDashboard } from "react-icons/md";
import { GrResources } from "react-icons/gr";

export default function DashboardSidebar({ userData, onLogout, userType }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabClick = (tab) => {
    setSearchParams({ tab })
    setIsMobileOpen(false)
  }

  // Define navigation based on user type
const getNavItems = () => {
  const baseItems = [
    { icon: MdDashboard, label: 'Dashboard', id: 'dashboard' },
  ]

  if (userType === 'alumni') {
    // For alumni: Insert dynamic courses between "My Courses" and "Certifications"
    const alumniBaseItems = [
      ...baseItems,
      { icon: FaUser, label: 'My Profile', id: 'profile' },
      { icon: FaWallet, label: 'My Courses', id: 'courses' },
      // Dynamic courses will be inserted here
      { icon: FaGraduationCap, label: 'Certifications', id: 'certifications' },
      { icon: FaWallet, label: 'Subscription', id: 'subscription' },
      { icon: FaAward, label: 'CPD Records', id: 'cpd', condition: userData?.verified },
      { icon: FaCog, label: 'Settings', id: 'settings' }
    ]

    // Find the index where "My Courses" is located
    const coursesIndex = alumniBaseItems.findIndex(item => item.id === 'courses')
    const certificationsIndex = alumniBaseItems.findIndex(item => item.id === 'certifications')
    
    // Insert dynamic courses between "My Courses" and "Certifications"
    if (userData?.courses && userData.courses.length > 0 && coursesIndex !== -1) {
      const dynamicCourseItems = userData.courses.map(course => ({
        icon: FaSwatchbook,
        label: course.name || 'Course',
        id: `course-${course.courseId}`,
        isCourseName: true
      }))
      
      // Insert dynamic courses at the position after "My Courses"
      alumniBaseItems.splice(certificationsIndex, 0, ...dynamicCourseItems)
    }

    return alumniBaseItems
    
  } else if (userType === 'student') {
    // For students: Insert dynamic courses between "My Courses" and "Certifications"
    const studentBaseItems = [
      ...baseItems,
      { icon: FaWallet, label: 'My Courses', id: 'courses' },
      // Dynamic courses will be inserted here
      { icon: FaGraduationCap, label: 'Certifications', id: 'certifications' },
      { icon: FaWallet, label: 'Subscription', id: 'subscription' },
      { icon: FaAward, label: 'CPD Records', id: 'cpd', condition: userData?.verified },
      { icon: FaCog, label: 'Settings', id: 'settings' }
    ]

    // Find the index where "Certifications" is located
    const certificationsIndex = studentBaseItems.findIndex(item => item.id === 'certifications')
    
    // Insert dynamic courses before "Certifications"
    if (userData?.courses && userData.courses.length > 0 && certificationsIndex !== -1) {
      const dynamicCourseItems = userData.courses.map(course => ({
        icon: FaSwatchbook,
        label: course.name || 'Course',
        id: `course-${course.courseId}`,
        isCourseName: true
      }))
      
      // Insert dynamic courses at the position before "Certifications"
      studentBaseItems.splice(certificationsIndex, 0, ...dynamicCourseItems)
    }

    return studentBaseItems
    
  } else if (userType === 'tutor') {
    return [
      ...baseItems,
      { icon: FaWallet, label: 'My Courses', id: 'courses' },
      { icon: FaUsers, label: 'My Students', id: 'mystudents' },
      { icon: FaSwatchbook, label: 'Curriculum', id: 'curriculum' },
      { icon: TbTableImport, label: 'Timetables', id: 'groupcurriculum' },
      { icon: GrResources, label: 'Resources', id: 'resources' },
      { icon: FaBook, label: 'Student Discussions', id: 'discussions' },
      { icon: FaGraduationCap, label: 'Certification', id: 'certification' },
      { icon: FaMoneyBillWave, label: 'Settlements', id: 'settlements' },
      { icon: FaCog, label: 'Settings', id: 'settings' }
    ]
  }

  return baseItems
}

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-5 left-4 md:hidden z-99999 p-2 rounded-lg bg-brand-gold text-white font-bold flex items-center gap-2"
      >
        {isMobileOpen ? (
          <>
            <FaTimes size={24} /> Close Menu
          </>
        ) : (
          <>
            <FaBars size={24} /> Open Menu
          </>
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-screen w-72 bg-brand-dark text-white overflow-y-auto z-9999 pt-8 px-6 md:pt-10 md:px-8"
        initial={{ x: -300 }}
        animate={{ x: isMobileOpen || window.innerWidth >= 768 ? 0 : -300 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Section */}
        <div className="mb-8 pb-8 border-b border-brand-gold">
          <div className="flex items-center gap-4">
            <img
              src={userData?.profilePicture?.url || userData?.profilePicture || '/placeholder-profile.jpg'}
              alt={`${userData?.firstName} ${userData?.lastName}`}
              className="w-16 h-16 rounded-full border-3 border-brand-gold object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">
                {userData?.firstName} {userData?.lastName}
              </h4>
              <p className="text-xs text-text-light capitalize">
                {userType}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            // Skip item if condition is false
            if (item.condition === false) return null
            return (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                onClick={() => handleTabClick(item.id)}
                isCourseName={item.isCourseName}
              />
            )
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm bg-red-600 hover:bg-red-700 text-white cursor-pointer"
        >
          <FaSignOutAlt /> Logout
        </button>
      </motion.aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

function NavButton({ icon: Icon, label, isActive, onClick, isCourseName }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${isActive
        ? 'bg-brand-gold text-brand-dark'
        : 'text-white hover:opacity-80'
        } ${isCourseName ? 'pl-8 text-sm' : ''}`}
    >
      <Icon className="flex-shrink-0" /> <span className="truncate">{label}</span>
    </button>
  )
}
