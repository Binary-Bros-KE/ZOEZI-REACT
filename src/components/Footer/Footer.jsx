import { Link } from "react-router-dom"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import "./Footer.css"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer z-60">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <div className="">
     <img src="/primary-logo.png" alt="" className="h-10" />
            </div>
            <p>
              Excellence in fitness and wellness education. Transforming careers, building professionals, shaping the
              future of fitness in Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/who-we-are">Who We Are</Link>
              </li>
              <li>
                <Link to="/what-we-do">What We Do</Link>
              </li>
              <li>
                <Link to="/apply-now">Apply Now</Link>
              </li>
              <li>
                <Link to="/search-members">Search Members</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <a href="tel:0746139413">0746 139 413</a>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:info@zoezischool.com">info@zoezischool.com</a>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <p>11th Floor, Development House, Opp. Afya Centre, Nairobi, Kenya</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon" title="Facebook">
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com/zoezischool"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                title="Instagram"
              >
                <FaInstagram />
              </a>
              <a href="#" className="footer-social-icon" title="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="footer-social-icon" title="Twitter">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Nairobi Zoezi SCHOOL. All rights reserved.</p>
          <p>
            NITA Accreditation: <strong>NITA/TRN/1553</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
