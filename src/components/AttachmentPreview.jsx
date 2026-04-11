// AttachmentPreview.js
import React, { useState, useEffect } from 'react'
import {
  FaYoutube, FaFilePdf, FaFileAlt, FaVideo, FaLink,
  FaImage, FaFile, FaExternalLinkAlt, FaPlay
} from 'react-icons/fa'

const AttachmentPreview = ({ type, url, title, className = '' }) => {
  const [thumbnail, setThumbnail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const getIcon = () => {
    switch (type) {
      case 'youtube': return FaYoutube
      case 'vimeo': return FaVideo
      case 'mp4': return FaVideo
      case 'pdf': return FaFilePdf
      case 'article': return FaFileAlt
      case 'document': return FaFile
      case 'image': return FaImage
      case 'link': return FaLink
      default: return FaExternalLinkAlt
    }
  }

  const getColor = () => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-600'
      case 'vimeo': return 'bg-blue-100 text-blue-600'
      case 'mp4': return 'bg-purple-100 text-purple-600'
      case 'pdf': return 'bg-red-100 text-red-600'
      case 'article': return 'bg-green-100 text-green-600'
      case 'document': return 'bg-gray-100 text-gray-600'
      case 'image': return 'bg-pink-100 text-pink-600'
      case 'link': return 'bg-indigo-100 text-indigo-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const renderPreview = () => {
    if (type === 'youtube') {
      const videoId = getYouTubeVideoId(url)
      if (videoId) {
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title || 'YouTube video'}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <FaPlay className="text-white ml-1" />
              </div>
            </div>
          </div>
        )
      }
    } else if (type === 'pdf') {
      return (
        <div className="aspect-[4/3] rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <FaFilePdf className="text-4xl text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">PDF Document</p>
          </div>
        </div>
      )
    } else if (type === 'image') {
      return (
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={url}
            alt={title || 'Image'}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      )
    }

    return (
      <div className="aspect-[4/3] rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          {React.createElement(getIcon(), { className: `text-4xl ${getColor().replace('bg-', 'text-').split(' ')[0]} mb-3` })}
          <p className="text-sm text-gray-600 capitalize">{type}</p>
        </div>
      </div>
    )
  }

  const Icon = getIcon()

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Preview */}
      <div className="relative">
        {renderPreview()}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getColor()} flex-shrink-0`}>
            <Icon />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 line-clamp-2">{title || 'Untitled'}</h4>
            <p className="text-xs text-gray-500 mt-1 truncate">{url}</p>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <FaExternalLinkAlt /> View Content
        </a>
      </div>
    </div>
  )
}

export default AttachmentPreview