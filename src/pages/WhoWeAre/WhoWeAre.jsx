"use client"
import { motion } from "framer-motion"
import "../../Pages.css"

export default function WhoWeAre() {
  const objectives = [
    "Professionalize the fitness industry by equipping trainers with advanced, research-based knowledge and practical skills.",
    "Promote fitness and wellness for all, regardless of age, gender, or physical condition, through qualified trainers capable of designing safe and effective exercise programs.",
    "Address health and safety concerns in fitness centers by ensuring trainers can assess, evaluate, and provide tailored exercise regimens for individuals with specific health conditions like diabetes, hypertension, and arthritis.",
    "Bridge the affordability gap by offering high-quality, globally aligned certifications at accessible costs for Kenyan students and fitness professionals.",
  ]

  const targetGroups = [
    "Individuals passionate about health, fitness, and wellness",
    "Aspiring gym instructors, personal trainers, and fitness coaches",
    "Professionals seeking career advancement or specialization in the fitness industry",
    "Gym owners and managers looking to upgrade their skills in gym management and client service",
    "High school graduates (minimum KCSE grade D Plain) seeking vocational training opportunities",
  ]

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2 className="text-4xl font-bold border-b-2 border-[#d4a644] w-fit mx-auto pb-2 mb-2 max-md:text-xl">Who We Are</h2>
          <p className="section-subtitle">Our Story & Mission</p>
        </div>

        <div className="section" style={{ marginTop: "2rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <h2 style={{ color: "#2b2520", marginBottom: "1rem", fontSize: "1.8rem" }}>Our Story</h2>
              <p style={{ color: "#555", lineHeight: "1.8", marginBottom: "1rem" }}>
                Established in 2017, Nairobi Zoezi Institute is a government-registered institution committed to
                excellence in fitness and wellness education. With a vision to transform the fitness industry in Kenya,
                we offer cutting-edge certification programs designed to prepare participants for careers as certified
                fitness trainers, personal fitness trainers, and nutrition experts. Over the years, we've successfully
                trained hundreds of fitness professionals who are now making a difference in Kenya's fitness and
                wellness sector.
              </p>
              <p style={{ color: "#555", lineHeight: "1.8", marginBottom: "1rem" }}>
                Our Fitness Science Certification Program is a 6-month, NITA-accredited course that combines practical
                and theoretical training to prepare participants for careers as certified fitness trainers, personal
                fitness trainers, and nutrition experts. Over the years, we've successfully trained hundreds of fitness
                professionals who are now making a difference in Kenya's fitness and wellness sector.
              </p>
              <p style={{ color: "#555", lineHeight: "1.8" }}>
                We are fully accredited by the National Industrial Training Authority (NITA) under accreditation number
                NITA/TRN/1553, ensuring that all training meets national vocational training standards. Our partnership
                with leading gyms and fitness centers, including Mazoezi Gym, guarantees industry-relevant training and
                placement opportunities for our graduates.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <img
                src="/hero.jpg"
                alt="NZI Training Facility"
                style={{ borderRadius: "12px", width: "100%", maxWidth: "400px" }}
              />
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="content-grid"
          style={{ marginBottom: "3rem" }}
        >
          <div className="content-box">
            <h3 style={{ color: "#d4a644" }}>Our Mission</h3>
            <p>
              To professionalize the fitness industry by delivering cutting-edge certification programs that equip
              trainers with advanced, research-based knowledge and practical skills meeting global standards while
              addressing local needs.
            </p>
          </div>

          <div className="content-box">
            <h3 style={{ color: "#d4a644" }}>Our Vision</h3>
            <p>
              To be the leading fitness education institution in East Africa, recognized for producing highly skilled,
              knowledgeable, and professional fitness trainers who advance wellness and transform lives through quality
              fitness education.
            </p>
          </div>

          <div className="content-box">
            <h3 style={{ color: "#d4a644" }}>Our Values</h3>
            <p>
              <strong>Excellence</strong> • <strong>Integrity</strong> • <strong>Innovation</strong> •{" "}
              <strong>Professionalism</strong> • <strong>Commitment to Student Success</strong>
            </p>
          </div>
        </motion.div>

        {/* Program Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #f5f5f3 0%, #faf9f7 100%)",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "3rem",
            borderLeft: "5px solid #d4a644",
          }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1.5rem" }}>Program Objectives</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {objectives.map((obj, idx) => (
              <li key={idx} style={{ marginBottom: "1rem", paddingLeft: "2rem", position: "relative", color: "#555" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "0.25rem",
                    width: "1rem",
                    height: "1rem",
                    background: "#d4a644",
                    borderRadius: "50%",
                  }}
                ></span>
                {obj}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Target Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem" }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1.5rem" }}>Who Should Apply?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {targetGroups.map((group, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "2px solid #e8c547",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(212, 166, 68, 0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <p style={{ color: "#2b2520", fontWeight: "500", margin: 0 }}>{group}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Course Duration & CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #2b2520 0%, #3d3531 100%)",
            color: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Program Duration</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", lineHeight: "1.8" }}>
            <strong>6 Months Total:</strong> 4 months of theoretical and practical training + 1 month
            internship/attachment
          </p>
          <p style={{ fontSize: "1rem", marginBottom: "1.5rem", opacity: 0.9 }}>
            Intakes offered in: January • April • July • October
          </p>
          <a
            href="/apply"
            style={{
              display: "inline-block",
              background: "#d4a644",
              color: "#2b2520",
              padding: "1rem 2.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.3s ease",
              fontSize: "1.1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e8c547"
              e.currentTarget.style.transform = "scale(1.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#d4a644"
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            Apply Now
          </a>
        </motion.div>
      </div>
    </div>
  )
}
