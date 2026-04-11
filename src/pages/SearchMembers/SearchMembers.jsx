"use client"

import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight } from "react-icons/fa"
import { useSearchParams, useNavigate } from "react-router-dom"
import { LiaCertificateSolid } from "react-icons/lia";
import { FaUserGraduate } from "react-icons/fa6";
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { PiStudent } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import "./SearchMembers.css"

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

export default function SearchMembers() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchResults, setSearchResults] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const initialLoadComplete = useRef(false)

  // Load all profiles on mount (only once)
  useEffect(() => {
    if (!initialLoadComplete.current) {
      loadAllProfiles()
      initialLoadComplete.current = true
    }
  }, [])

  // Auto-search if query param exists on initial load
  useEffect(() => {
    if (searchParams.get("q") && allProfiles.length > 0 && !hasSearched) {
      handleSearch(null, true)
    }
  }, [searchParams, allProfiles, hasSearched])

  // Debounced search for autocomplete
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      fetchAutocompleteSuggestions(debouncedSearchQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedSearchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadAllProfiles = async () => {
    try {
      setIsLoadingProfiles(true)
      const response = await fetch(`${API_BASE_URL}/students/public/all`)
      const data = await response.json()
      
      if (response.ok) {
        setAllProfiles(data.data.profiles || [])
      } else {
        toast.error("Failed to load profiles")
      }
    } catch (error) {
      console.error("Load profiles error:", error)
      toast.error("Failed to load profiles")
    } finally {
      setIsLoadingProfiles(false)
    }
  }

  const fetchAutocompleteSuggestions = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/public/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      
      if (response.ok) {
        setSuggestions(data.data.suggestions || [])
      }
    } catch (error) {
      console.error("Autocomplete error:", error)
    }
  }

  const handleSearch = async (e, fromParam = false) => {
    if (e) e.preventDefault()
    
    // If empty query, show all profiles
    if (!searchQuery.trim()) {
      setHasSearched(false)
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setShowSuggestions(false)

    try {
      const response = await fetch(`${API_BASE_URL}/students/public/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.data.results || [])
        if (data.data.results.length === 0) {
          toast.error(`No members found matching "${searchQuery}"`, {
            duration: 3000
          })
        }
      } else {
        throw new Error(data.message || "Search failed")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error(error.message || "Search failed")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    // Trigger search with the selected suggestion
    setTimeout(() => {
      handleSearch(null)
    }, 100)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.trim().length >= 2)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Use memoization to prevent unnecessary re-renders
  const ProfileCard = useCallback(({ profile, isAlumni }) => (
    <motion.div
      className="profile-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      key={`${profile.admissionNumber}-${profile._id}`}
    >
      {/* Certified Professional Ribbon */}
      {profile.verified ? (
        <div className="certified-ribbon">
          <span><LiaCertificateSolid size={15} />CERTIFIED</span>
        </div>
      ) : (
        <div className="student-ribbon">
          <span><LiaCertificateSolid size={15} />STUDENT</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper flex gap-4">
          <img
            src={profile.profilePicture || '/placeholder-profile.jpg'}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="profile-image"
            onError={(e) => (e.target.src = '/placeholder-profile.jpg')}
          />
          <div className="text-left">
            <h3 className="profile-name uppercase">
              {profile.firstName} {profile.lastName}
            </h3>

            {/* ID Number */}
            <div className="profile-id">
              <strong></strong> {profile.admissionNumber || 'N/A'}
            </div>

            {/* Course */}
            <div className="profile-course">
              <strong>Certified in: <br /> </strong> {profile.course || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-content">

        {/* Contact Info */}
        <div className="profile-contact">
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="contact-link flex justify-between" title="Call">
              <span>Phone</span>
              <span>{profile.phone}</span>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="contact-link flex justify-between" title="Email">
              <span>Email:</span>
              <span>{profile.email}</span>
            </a>
          )}

          <a className="contact-link flex justify-between" title="Email">
            <span>Current Location:</span>
            {profile.currentLocation ? (
              <span>{profile.currentLocation}</span>) : (
              <span>....</span>
            )}
          </a>
        </div>

        {/* View Profile Button */}
        <button
          className="bg-[#2b2520] hover:bg-[#d4a644] cursor-pointer text-white font-semibold py-2 px-4 rounded mt-4 w-full flex items-center justify-center gap-2"
          onClick={() => navigate('/profile-detail', { state: { profile } })}
        >
          View Profile <FaArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  ), [navigate])

  // Memoize the results to prevent unnecessary re-renders
  const displayedProfiles = useMemo(() => {
    if (hasSearched && !isSearching) {
      return searchResults
    }
    return allProfiles
  }, [hasSearched, isSearching, searchResults, allProfiles])

  const displayCount = useMemo(() => {
    if (hasSearched && !isSearching) {
      return searchResults.length
    }
    return allProfiles.length
  }, [hasSearched, isSearching, searchResults.length, allProfiles.length])

  const shouldShowAllProfiles = useMemo(() => {
    return !hasSearched && !isLoadingProfiles && allProfiles.length > 0
  }, [hasSearched, isLoadingProfiles, allProfiles.length])

  const shouldShowNoResults = useMemo(() => {
    return hasSearched && !isSearching && searchResults.length === 0
  }, [hasSearched, isSearching, searchResults.length])

  return (
    <div className="page search-members-page">
      <div className="p-2 md:p-4 lg:p-8">
        <div className="mx-auto text-center mb-2">
          <p className="text-primary-gold">Search and verify Zoezi Students and Alumni</p>
        </div>

        {/* Search Form */}
        <motion.form
          className="search-form"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="search-wrapper relative" ref={suggestionsRef}>
            <div className="flex items-center gap-2">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or phone..."
                className="search-input"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              />
            </div>
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </button>

            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  className="suggestions-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {suggestions.map((suggestion, index) => (
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
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Search Tips */}
          <div className="search-tips">
            <p className="text-sm text-gray-600 mt-2">
              Tip: Try searching by <strong>first name</strong>, <strong>last name</strong>, 
              <strong> email</strong>, <strong>phone</strong>, or <strong>admission number</strong>
            </p>
          </div>
        </motion.form>

        {/* Results Section - FIXED: Minimize re-renders */}
        <div className="search-results">
          {/* Loading State */}
          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div
                key="loading"
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="spinner"></div>
                <p>Searching...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {!isSearching && displayedProfiles.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="results-count">
                  {hasSearched ? `Found ${displayCount} member(s)` : `All Members (${displayCount})`}
                </p>
                <div className="results-grid">
                  {displayedProfiles.map((profile) => (
                    <ProfileCard
                      key={`${profile.admissionNumber}-${profile._id}`}
                      profile={profile}
                      isAlumni={profile.status === 'alumni'}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          <AnimatePresence>
            {shouldShowNoResults && (
              <motion.div
                className="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>No members found matching "{searchQuery}"</p>
                <p className="no-results-hint">Try searching with a different name, ID, email, or phone number</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial State - All Profiles */}
          <AnimatePresence>
            {shouldShowAllProfiles && displayedProfiles.length === 0 && (
              <motion.div
                className="search-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>No members available. Use the search bar to find student and professional credentials</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial Loading */}
          <AnimatePresence>
            {isLoadingProfiles && !hasSearched && (
              <motion.div
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="spinner"></div>
                <p>Loading profiles...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}