"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { HiMenu, HiX } from "react-icons/hi"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaSearch } from "react-icons/fa"
import { FiMail, FiMapPin } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import { LuSearch } from "react-icons/lu";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebookSquare } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import "./Navbar.css"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Debounced search query for autocomplete
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const openSearchModal = () => {
    setShowSearchModal(true)
    setShowSuggestions(searchQuery.trim().length >= 2)
  }

  const closeSearchModal = () => {
    setShowSearchModal(false)
    setShowSuggestions(false)
    setSearchQuery("")
  }

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      fetchAutocompleteSuggestions(debouncedSearchQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedSearchQuery])

  // Focus input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100)
    }
  }, [showSearchModal])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    if (showSearchModal) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSearchModal])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && showSearchModal) {
        closeSearchModal()
      }
    }
    
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showSearchModal])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fetchAutocompleteSuggestions = async (query) => {
    try {
      setIsLoadingSuggestions(true)
      const response = await fetch(`${API_BASE_URL}/students/public/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      
      if (response.ok) {
        setSuggestions(data.data.suggestions || [])
      }
    } catch (error) {
      console.error("Autocomplete error:", error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search-members?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name)
    window.location.href = `/search-members?q=${encodeURIComponent(suggestion.name)}`
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.trim().length >= 2)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Who We Are", path: "/who-we-are" },
    { label: "Our Courses", path: "/what-we-do" },
    { label: "Apply Now", path: "/apply-now" },
    { label: "Register", path: "/register" },
  ]

  const socialIcons = [
    { icon: FaFacebook, url: "#" },
    { icon: FaInstagram, url: "#" },
    { icon: FaLinkedin, url: "#" },
    { icon: FaTwitter, url: "#" },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Top bar */}
          <div
            className={`hidden lg:block transition-all duration-300 ${scrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"}`}
          >
            <div className="bg-purple-100 flex items-center h-10 gap-5">
              <div className="flex bg-primary-gold h-full flex items-center px-4 gap-4 pl-18 pr-10">
                <a href="https://www.instagram.com/zoezischool/?hl=en" className="text-white" target="_blank">
                  <AiFillInstagram size={20} />
                </a>
                <a href="https://www.facebook.com/zoeziinstitute/" className="text-white" target="_blank">
                  <FaFacebookSquare size={20} />
                </a>
                <a href="https://www.tiktok.com/@zoezischool" className="text-white" target="_blank">
                  <AiFillTikTok size={20} />
                </a>
                <a href="https://x.com/zoeziinstitute" className="text-white" target="_blank">
                  <FaXTwitter size={20} />
                </a>
              </div>
              <div className="flex justify-between w-full pr-18">
                <div className="flex items-center gap-6 text-sm ">
                  <span className="flex items-center gap-2">
                    <FiMapPin className="" />
                    Development House, 11th Floor
                  </span>
                  <span className="flex items-center gap-2">
                    <FiMail className="" />
                    info@zoezischool.com
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <a href="/login" className="text-gray-500">Portal</a>
                  <a href="/search-members" className="text-gray-500">Alumni</a>
                  <a href="/apply-now" className="text-gray-500">Intake</a> |
                  <a href="/contact" className="text-gray-500">Contact Us</a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center w-full px-14 max-md:px-3 py-3 mx-auto">

            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="logo-wrapper">
                <img src="/primary-logo.png" alt="" className="h-10" />
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="desktop-menu">
              <div className="nav-links">
                {menuItems.map((item) => (
                  <Link key={item.path} to={item.path} className="nav-link" onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              {/* Search Button */}
              <button 
                className="text-white mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={openSearchModal}
                aria-label="Search"
              >
                <LuSearch size={22} />
              </button>
              
              {/* Hamburger Menu for mobile */}
              <button className="hamburger md:hidden" onClick={toggleMenu}>
                {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
              </button>

              {/* Desktop buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/search-members" className="btn-search">
                  Search Member
                </Link>
                <Link to="/login" className="btn-login">
                  Join / Login
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="mobile-menu"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mobile-menu-content">
                    {/* Search in mobile menu */}
                    <button 
                      className="mobile-search-btn flex items-center gap-2 mb-4 p-3 bg-white/10 rounded-lg"
                      onClick={() => {
                        setIsOpen(false)
                        openSearchModal()
                      }}
                    >
                      <LuSearch size={20} />
                      <span>Search students or professionals...</span>
                    </button>

                    <div className="mobile-nav-links">
                      {menuItems.map((item) => (
                        <Link key={item.path} to={item.path} className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="mobile-actions">
                      <Link to="/search-members" className="btn-search mobile-btn" onClick={() => setIsOpen(false)}>
                        Search Member
                      </Link>
                      <Link to="/login" className="btn-login mobile-btn" onClick={() => setIsOpen(false)}>
                        Join / Login
                      </Link>
                    </div>

                    {/* Mobile Social Icons */}
                    <div className="mobile-socials">
                      {socialIcons.map((social, index) => {
                        const Icon = social.icon
                        return (
                          <a
                            key={index}
                            href={social.url}
                            className="mobile-social-icon"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon size={24} />
                          </a>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            className="search-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearchModal}
          >
            <motion.div
              className="search-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="search-modal-input-wrapper" ref={suggestionsRef}>
                <form onSubmit={handleSearch} className="w-full">
                  <div className="search-modal-input-container">
                    <FaSearch className="search-modal-icon" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search student or certified professional..."
                      className="search-modal-input"
                      value={searchQuery}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  </div>
                </form>
                
                {/* Autocomplete Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      className="search-modal-suggestions"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoadingSuggestions ? (
                        <div className="suggestion-item">
                          <div className="suggestion-loading">Loading suggestions...</div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={`${suggestion.email}-${index}`}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="suggestion-name">{suggestion.display}</div>
                            <div className="suggestion-type">
                              <span className={`suggestion-type-badge ${suggestion.type.toLowerCase()}`}>
                                {suggestion.type}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="suggestion-item">
                          <div className="suggestion-no-results">No suggestions found</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close button */}
              <button
                className="search-modal-close"
                onClick={closeSearchModal}
                aria-label="Close search"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}