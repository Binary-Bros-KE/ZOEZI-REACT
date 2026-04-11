// components/CoursesSection.jsx
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"
import CourseCard from "../../../components/CourseCard"

export default function CoursesSection() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [displayLimit, setDisplayLimit] = useState(6) // Show 6 courses on home page

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const apiUrl = import.meta.env.VITE_SERVER_URL
        const response = await fetch(`${apiUrl}/courses?status=active`)

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`)
        }

        const data = await response.json()
        setCourses(data.data.courses || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [displayLimit])

  return (
    <section className="section bg-gray-50 py-10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-primary-dark mb-4">
            Our Popular Courses
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-400 mx-auto"></div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
              <p className="text-secondary mt-4">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8 text-center"
          >
            <p className="text-red-700 font-semibold">Error loading courses</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </motion.div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.map((course, idx) => (
              <CourseCard
                key={course._id || course.id}
                course={course}
                index={idx}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl font-bold text-primary-dark mb-2">No Courses Available</p>
            <p className="text-secondary">Check back soon for new course offerings</p>
          </motion.div>
        )}

        {/* View All Courses CTA */}
        {courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/what-we-do"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-gold border-2 border-brand-gold text-white rounded-lg font-semibold hover:bg-brand-gold hover:text-white transition-all duration-200 group"
            >
              Explore All {courses.length}+ Courses
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}