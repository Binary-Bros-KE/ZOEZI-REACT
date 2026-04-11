"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import CourseCard from "../../components/CourseCard" // Updated import

export default function WhatWeDo() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const apiUrl = import.meta.env.VITE_SERVER_URL
        const response = await fetch(`${apiUrl}/courses?limit=100&status=active`)

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
  }, [])

  return (
    <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Our Courses</h1>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-4"></div>
          <p className="text-lg text-secondary max-w-2xl mx-auto">Explore our comprehensive and dynamic course offerings</p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course, idx) => (
              <CourseCard
                key={course._id || course.id}
                course={course}
                index={idx}
                showAllDetails={true} // Show full details on courses page
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

        {/* Why Choose Us Section (unchanged) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 bg-primary-brown rounded-lg p-8 md:p-12 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Why Choose Our Courses?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-gold mb-2">NITA</div>
              <h4 className="text-lg font-semibold mb-2">Accredited</h4>
              <p className="text-off-white text-sm">Fully accredited by National Industrial Training Authority</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-gold mb-2">100%</div>
              <h4 className="text-lg font-semibold mb-2">Industry Focused</h4>
              <p className="text-off-white text-sm">Guaranteed placements through industry partnerships</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-gold mb-2">Flexible</div>
              <h4 className="text-lg font-semibold mb-2">Learning</h4>
              <p className="text-off-white text-sm">Physical, online, and weekend classes available</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-gold mb-2">Practical</div>
              <h4 className="text-lg font-semibold mb-2">Focused</h4>
              <p className="text-off-white text-sm">Hands-on learning with real-world applications</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
