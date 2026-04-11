"use client"

import { useState, useEffect, useRef } from 'react';
import { GrSearchAdvanced } from 'react-icons/gr';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline } from 'react-icons/io5';
import { FaPause, FaPlay } from 'react-icons/fa';

export default function GalleryComponent({ images = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);
    const modalTimerRef = useRef(null);

    // Auto-rotate for main carousel
    useEffect(() => {
        if (!isModalOpen && isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
            }, 5000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isModalOpen, isPlaying, images.length]);

    // Auto-rotate for modal
    useEffect(() => {
        if (isModalOpen && isPlaying) {
            modalTimerRef.current = setInterval(() => {
                nextSlide();
            }, 3000);
        }
        return () => {
            if (modalTimerRef.current) {
                clearInterval(modalTimerRef.current);
            }
        };
    }, [isModalOpen, isPlaying]);

    const openModal = (index) => {
        setCurrentIndex(index);
        setIsModalOpen(true);
        setIsPlaying(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsPlaying(true);
    };

    const nextSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === ' ') {
            e.preventDefault();
            togglePlayPause();
        }
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    };

    // Handle keyboard events
    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isModalOpen, isPlaying]);

    return (
        <>
            {/* Full-screen Carousel */}
            <section className="w-full h-screen relative overflow-hidden">
                <div className="relative h-full w-full">
                    {/* Main Image */}
                    <div className="absolute inset-0">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                        ))}
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-4 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full">
                        <button
                            onClick={prevSlide}
                            className="text-white hover:text-blue-300 transition-colors p-2"
                            aria-label="Previous slide"
                        >
                            <IoChevronBackCircleOutline className="w-8 h-8" />
                        </button>
                        
                        <button
                            onClick={() => openModal(currentIndex)}
                            className="text-white hover:text-blue-300 transition-colors px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold text-sm uppercase tracking-wider"
                            aria-label="Open gallery view"
                        >
                            View Gallery
                        </button>
                        
                        <button
                            onClick={nextSlide}
                            className="text-white hover:text-blue-300 transition-colors p-2"
                            aria-label="Next slide"
                        >
                            <IoChevronForwardCircleOutline className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </section>

            {/* Fullscreen Modal Gallery */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black z-99999 flex flex-col"
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">Gallery</h2>
                                <p className="text-sm text-gray-300 mt-1">{images.length} images</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlayPause}
                                    className="text-white hover:text-blue-300 transition-colors p-2"
                                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                                >
                                    {isPlaying ? (
                                        <FaPause className="w-6 h-6" />
                                    ) : (
                                        <FaPlay className="w-6 h-6" />
                                    )}
                                </button>

                                <button
                                    onClick={closeModal}
                                    className="text-white hover:text-red-300 transition-colors p-2"
                                    aria-label="Close gallery"
                                >
                                    <IoIosCloseCircleOutline className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 flex items-center justify-center p-4 relative">
                        <div className="relative w-full h-full max-w-7xl mx-auto">
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-300 transition-colors z-10 bg-black/30 hover:bg-black/50 p-4 rounded-full backdrop-blur-sm"
                            aria-label="Previous image"
                        >
                            <IoChevronBackCircleOutline className="w-10 h-10" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-300 transition-colors z-10 bg-black/30 hover:bg-black/50 p-4 rounded-full backdrop-blur-sm"
                            aria-label="Next image"
                        >
                            <IoChevronForwardCircleOutline className="w-10 h-10" />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Counter */}
                            <div className="flex justify-center items-center gap-6 mb-4">
                                <div className="text-white text-lg font-medium bg-black/30 px-4 py-2 rounded-full">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="overflow-x-auto pb-2">
                                <div className="flex gap-2 justify-center min-w-max">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${currentIndex === index ? 'ring-4 ring-blue-500 scale-110' : 'opacity-60 hover:opacity-100'
                                                }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        >
                                            <img
                                                src={image}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}