"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowRight } from "react-icons/fa"
import HeroSection from "./components/HeroSection"
import "../../Pages.css"
import { GrCertificate, GrMoney } from "react-icons/gr"
import { LuDumbbell } from "react-icons/lu"
import { GiGymBag } from "react-icons/gi"
import GalleryComponent from "../../components/GalleryComponent"
import CoursesSection from "./components/CoursesSection"

export default function Home() {
  return (
    <div className="">
      <HeroSection />

      <CoursesSection />

      {/* About Preview Section */}
      <section className="about-preview pb-10">
        <div className="container">
          <div className="section-header">
            <p className="text-4xl font-bold border-b-2 border-[#d4a644] w-fit mx-auto pb-2 mb-2 max-md:text-xl">Welcome to Nairobi Zoezi Institute</p>
            <p className="section-subtitle">Excellence in Fitness and Wellness Education</p>
          </div>

          <div className="content-grid">
            <motion.div
              className="content-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="box-icon">
                <GrCertificate />
              </div>
              <h3>NITA Accredited</h3>
              <p>
                Fully accredited by the National Industrial Training Authority (Accreditation: NITA/TRN/1553) ensuring
                international recognition.
              </p>
            </motion.div>

            <motion.div
              className="content-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="box-icon">
                <LuDumbbell />
              </div>
              <h3>Expert Training</h3>
              <p>
                Comprehensive 6-month fitness science certification program combining theoretical and practical training
                at the highest standards.
              </p>
            </motion.div>

            <motion.div
              className="content-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="box-icon">
                <GiGymBag />
              </div>
              <h3>Career Placement</h3>
              <p>
                Industry partnerships and job placement opportunities with leading gyms and fitness centers across Kenya
                and internationally.
              </p>
            </motion.div>

            <motion.div
              className="content-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="box-icon">
                <GrMoney />
              </div>
              <h3>Affordable Fees</h3>
              <p>
                Flexible payment plans making quality fitness education accessible to all students with monthly
                installment options available.
              </p>
            </motion.div>
          </div>

          <div className="cta-section">
            <Link to="/apply-now" className="btn-apply-large">
              Apply Now & Start Your Journey
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            <motion.div
              className="index-stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>6 Months</h3>
              <p>Complete Program Duration</p>
            </motion.div>

            <motion.div
              className="index-stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>4 Intakes</h3>
              <p>January, April, July, October</p>
            </motion.div>

            <motion.div
              className="index-stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3>100%</h3>
              <p>Industry Recognized Certificate</p>
            </motion.div>

            <motion.div
              className="index-stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>Affordable</h3>
              <p>Pricing With Flexible Payments</p>
            </motion.div>
          </div>
        </div>
      </section>

      <GalleryComponent images={[
        "/gallery/10.jpg",
        "/gallery/11.jpg",
        "/hero.jpg",
        "/gallery/1.jpg",
        "/gallery/5.jpg",
        "/gallery/2.jpg",
        "/gallery/4.jpg",
        "/gallery/3.jpg",
        "/gallery/6.jpg",
        "/gallery/7.jpg",
        "/gallery/8.jpg",
        "/gallery/9.jpg",
      ]} />

      {/* CTA Banner */}
      <section className="section cta-banner">
        <div className="container">
          <div className="banner-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join the next intake and become a certified fitness professional</p>
            <Link to="/apply-now" className="btn-apply">
              Apply Today
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
