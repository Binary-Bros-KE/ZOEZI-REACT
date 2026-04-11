"use client"

import { motion } from "framer-motion"
import { FaRegCircleCheck } from "react-icons/fa6"
import { useNavigate } from "react-router-dom"

export default function SuccessModal({ onClose }) {
  const navigate = useNavigate()

  const handleClose = () => {
    onClose()
    navigate("/")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "3rem 2rem",
          textAlign: "center",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <FaRegCircleCheck className="w-fit mx-auto" style={{ fontSize: "4rem", color: "#d4a644" }} />
        </motion.div>

        <h2 style={{ color: "#2b2520", marginBottom: "1rem", fontSize: "1.8rem" }}>Success!</h2>

        <p style={{ color: "#666", marginBottom: "1.5rem", lineHeight: "1.6", fontSize: "1rem" }}>
          Thank you for applying to Nairobi Zoezi Institute. Your Information is pending approval. <br />
        </p>

        <p className="mb-3">
          In the mean time you have access to: <br />
         <span className="font-bold"> ✅ Alumni Dashboard Via Login Page <br />
          ✅ Your Name Appears in the Alumni List <br /></span>
        </p> 

        <p className="mb-3">
          However if admin dicovers any misleading information provided your account may be rejected.
        </p>

        <p style={{ color: "#999", marginBottom: "2rem", fontSize: "0.9rem" }}>
          For inquiries, contact us at 0746 139 413
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClose}
          style={{
            background: "linear-gradient(135deg, #2b2520 0%, #3d3531 100%)",
            color: "#fff",
            border: "none",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          Return to Home
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
