import React from 'react'

export default function SuccessModal({ onClose, title = "Success!", message = "Operation completed successfully." }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-[#d4a644] to-[#b38d38] text-white font-semibold rounded-lg hover:from-[#b38d38] hover:to-[#94752d] transition-all duration-300"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}