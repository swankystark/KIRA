import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GovernmentBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Government announcements data
    const announcements = [
        {
            id: 1,
            title: "Digital India Initiative",
            subtitle: "Transforming City through Technology",
            description: "Report civic issues instantly through our AI-powered grievance portal. Get faster resolutions with real-time tracking.",
            icon: "🇮🇳",
            background: "linear-gradient(135deg, #1F4E78 0%, #153456 100%)",
            textColor: "#FFFFFF",
            accentColor: "#F77F00",
            image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=400&fit=crop&crop=center"
        },
        {
            id: 2,
            title: "Swachh Bharat Mission",
            subtitle: "Clean City, Green City",
            description: "Join our cleanliness drive. Report garbage issues and help maintain hygiene standards for a healthier tomorrow.",
            icon: "🌱",
            background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
            textColor: "#FFFFFF",
            accentColor: "#4CAF50",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center"
        },
        {
            id: 3,
            title: "Smart City Mission",
            subtitle: "Building Tomorrow Today",
            description: "Advanced infrastructure monitoring with IoT sensors. Real-time issue detection and automated municipal responses.",
            icon: "🏙️",
            background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
            textColor: "#FFFFFF",
            accentColor: "#2196F3",
            image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=400&fit=crop&crop=center"
        },
        {
            id: 4,
            title: "Citizen First Initiative",
            subtitle: "Your Voice, Our Priority",
            description: "24/7 grievance redressal system. Track your complaints in real-time and get updates directly on your mobile.",
            icon: "👥",
            background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
            textColor: "#FFFFFF",
            accentColor: "#FF9800",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop&crop=center"
        },
        {
            id: 5,
            title: "Emergency Response System",
            subtitle: "Rapid Action for Critical Issues",
            description: "AI-powered priority detection for emergency situations. Critical issues get immediate attention from our response teams.",
            icon: "🚨",
            background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
            textColor: "#FFFFFF",
            accentColor: "#F44336",
            image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=400&fit=crop&crop=center"
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % announcements.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, announcements.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
        setIsAutoPlaying(false);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    };

    const currentAnnouncement = announcements[currentSlide];

    return (
        <div style={{
            position: 'relative',
            height: '400px',
            backgroundColor: '#1F4E78',
            overflow: 'hidden',
            borderRadius: '0.5rem',
            boxShadow: '0 8px 32px rgba(31, 78, 120, 0.3)'
        }}>
            {/* Background Image with Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${currentAnnouncement.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: currentAnnouncement.background,
                    opacity: 0.85
                }} />
            </div>

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0 3rem'
            }}>
                <div style={{
                    maxWidth: '600px',
                    color: currentAnnouncement.textColor
                }}>
                    {/* Icon */}
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <span>{currentAnnouncement.icon}</span>
                        <div style={{
                            width: '4px',
                            height: '60px',
                            backgroundColor: currentAnnouncement.accentColor,
                            borderRadius: '2px'
                        }} />
                    </div>

                    {/* Title */}
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.2',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {currentAnnouncement.title}
                    </h2>

                    {/* Subtitle */}
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '500',
                        margin: '0 0 1rem 0',
                        color: currentAnnouncement.accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {currentAnnouncement.subtitle}
                    </h3>

                    {/* Description */}
                    <p style={{
                        fontSize: '1.125rem',
                        lineHeight: '1.6',
                        margin: '0 0 2rem 0',
                        opacity: 0.95,
                        maxWidth: '500px'
                    }}>
                        {currentAnnouncement.description}
                    </p>

                    {/* CTA Button */}
                    <button style={{
                        padding: '1rem 2rem',
                        backgroundColor: currentAnnouncement.accentColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    >
                        Learn More →
                    </button>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.3s',
                    zIndex: 20
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(247, 127, 0, 0.8)';
                    e.target.style.borderColor = '#F77F00';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.3s',
                    zIndex: 20
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(247, 127, 0, 0.8)';
                    e.target.style.borderColor = '#F77F00';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.75rem',
                zIndex: 20
            }}>
                {announcements.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            backgroundColor: index === currentSlide ? 'white' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            if (index !== currentSlide) {
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (index !== currentSlide) {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                zIndex: 20
            }}>
                <div style={{
                    height: '100%',
                    backgroundColor: currentAnnouncement.accentColor,
                    width: `${((currentSlide + 1) / announcements.length) * 100}%`,
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Auto-play Indicator */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontSize: '0.75rem',
                zIndex: 20
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isAutoPlaying ? '#4CAF50' : '#F44336',
                    animation: isAutoPlaying ? 'pulse 2s infinite' : 'none'
                }} />
                <span>{isAutoPlaying ? 'AUTO' : 'MANUAL'}</span>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default GovernmentBanner;