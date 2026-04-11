"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes
 * Uses smooth scroll behavior for better UX
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top smoothly when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return null
}
