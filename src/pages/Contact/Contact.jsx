"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa"
import "./Contact.css"
import toast from "react-hot-toast"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Message sent:", formData)
    toast.success("Message sent! We will get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="page contact-page">
      <div className="container">
        <div className="section-header" style={{ marginTop: "2rem" }}>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Get in Touch With Our Team</p>
        </div>

        <div className="contact-grid">
          {/* Contact Info */}
          <motion.div
            className="contact-info-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h4>Phone</h4>
                <p>
                  <a href="tel:0746139413">0746 139 413</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <h4>Email</h4>
                <p>
                  <a href="mailto:info@zoezi.co.ke">info@zoezi.co.ke</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h4>Address</h4>
                <p>
                  11th Floor, Development House
                  <br />
                  Opp. Afya Centre, Nairobi, Kenya
                </p>
              </div>
            </div>

            <div className="info-item">
              <FaWhatsapp className="info-icon" />
              <div>
                <h4>WhatsApp</h4>
                <p>
                  <a href="https://wa.me/254746139413" target="_blank" rel="noopener noreferrer">
                    Chat with us
                  </a>
                </p>
              </div>
            </div>

            <div className="operating-hours">
              <h4>Operating Hours</h4>
              <p>
                <strong>Classes:</strong> Monday - Friday, 9:00 AM - 11:00 AM
              </p>
              <p>
                <strong>Online Classes:</strong> Twice a week from 8:00 PM
              </p>
              <p>
                <strong>Weekend:</strong> Practical sessions available
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="contact-form-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Program Inquiry"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-send">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
