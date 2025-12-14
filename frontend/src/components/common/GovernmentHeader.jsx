import React, { useState } from 'react';
import { Search, ChevronDown, Menu, Globe } from 'lucide-react';

const GovernmentHeader = ({ user, onLogout, onToggleTheme, theme }) => {
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAboutDropdown, setShowAboutDropdown] = useState(false);
    const [showDepartmentsDropdown, setShowDepartmentsDropdown] = useState(false);
    const [showZonesDropdown, setShowZonesDropdown] = useState(false);
    const [showCitizenCornerDropdown, setShowCitizenCornerDropdown] = useState(false);

    return (
        <div>
            {/* Top Government Bar */}
            <div style={{
                backgroundColor: '#1B3A4B',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.5rem 0'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>🇮🇳 INDIA.GOV.IN</span>
                        <span style={{ color: '#F77F00' }}>|</span>
                        <span>हिन्दी</span>
                        <span style={{ color: '#F77F00' }}>|</span>
                        <span>Accessibility</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>Reception: +91-11-23378000</span>
                        <span style={{ color: '#F77F00' }}>|</span>
                        <span>Emergency: 100</span>
                    </div>
                </div>
            </div>

            {/* Main Government Header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '3px solid #F77F00',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Government Emblem & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#1F4E78',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            🏛️
                        </div>
                        
                        <div>
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#1F4E78',
                                margin: 0,
                                lineHeight: '1.2'
                            }}>
                                UNIFIED MUNICIPAL PLATFORM
                            </h1>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#1F4E78',
                                margin: 0,
                                lineHeight: '1.2'
                            }}>

                            </h2>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                                margin: '0.25rem 0 0 0',
                                fontWeight: '500'
                            }}>
                                Official Portal • Citizen Grievance Portal
                            </p>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Search Box */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            backgroundColor: '#F5F7FA',
                            border: '2px solid #E3EEF7',
                            borderRadius: '0.375rem',
                            padding: '0.5rem',
                            minWidth: '200px'
                        }}>
                            <Search className="w-4 h-4 text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '0.875rem',
                                    color: '#1B3A4B',
                                    width: '100%'
                                }}
                            />
                        </div>

                        {/* Language Selector */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: '#1F4E78',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                <Globe className="w-4 h-4" />
                                EN
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            {showLanguageMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.25rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 50,
                                    minWidth: '120px'
                                }}>
                                    <button style={{ width: '100%', padding: '0.5rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        🇬🇧 English
                                    </button>
                                    <button style={{ width: '100%', padding: '0.5rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        🇮🇳 हिन्दी
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: '#F77F00',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                👤 {user?.name?.split(' ')[0] || 'User'}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            {showProfileMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.25rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 50,
                                    minWidth: '160px'
                                }}>
                                    <button style={{ width: '100%', padding: '0.75rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        👤 My Profile
                                    </button>
                                    <button 
                                        onClick={onToggleTheme}
                                        style={{ width: '100%', padding: '0.75rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {theme === 'dark' ? '☀️' : '🌙'} Theme
                                    </button>
                                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #E3EEF7' }} />
                                    <button 
                                        onClick={onLogout}
                                        style={{ width: '100%', padding: '0.75rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div style={{
                backgroundColor: '#1F4E78',
                color: 'white'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Main Navigation */}
                    <nav style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* HOME */}
                        <button
                            style={{
                                padding: '1rem 1.5rem',
                                backgroundColor: '#F77F00',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            HOME
                        </button>

                        {/* ABOUT US with Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseEnter={() => setShowAboutDropdown(true)}
                                onMouseLeave={() => setShowAboutDropdown(false)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: showAboutDropdown ? 'rgba(247, 127, 0, 0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                ABOUT US
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* About Us Dropdown - Simplified for space */}
                            {showAboutDropdown && (
                                <div 
                                    onMouseEnter={() => setShowAboutDropdown(true)}
                                    onMouseLeave={() => setShowAboutDropdown(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        backgroundColor: 'white',
                                        border: '2px solid #E3EEF7',
                                        borderTop: '3px solid #F77F00',
                                        borderRadius: '0 0 0.5rem 0.5rem',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        minWidth: '600px',
                                        padding: '1.5rem'
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1F4E78', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                                ORGANIZATION OVERVIEW
                                            </h3>
                                            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                <strong>Mission:</strong> "Empower citizens through transparent, accountable civic governance"
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                <strong>Vision:</strong> "A city where every civic issue is resolved within 48 hours"
                                            </p>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1F4E78', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                                LEADERSHIP
                                            </h3>
                                            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                <strong>Commissioner:</strong> Sh. Rajesh Kumar Singh
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                <strong>Contact:</strong> commissioner@mcd.gov.in
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* DEPARTMENTS with Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseEnter={() => setShowDepartmentsDropdown(true)}
                                onMouseLeave={() => setShowDepartmentsDropdown(false)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: showDepartmentsDropdown ? 'rgba(247, 127, 0, 0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                DEPARTMENTS
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Departments Dropdown - Simplified */}
                            {showDepartmentsDropdown && (
                                <div 
                                    onMouseEnter={() => setShowDepartmentsDropdown(true)}
                                    onMouseLeave={() => setShowDepartmentsDropdown(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        backgroundColor: 'white',
                                        border: '2px solid #E3EEF7',
                                        borderTop: '3px solid #F77F00',
                                        borderRadius: '0 0 0.5rem 0.5rem',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        minWidth: '800px',
                                        padding: '1.5rem'
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.75rem' }}>
                                                ⚡ ELECTRICAL MAINTENANCE
                                            </h4>
                                            <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                Streetlights, power lines, transformers
                                            </p>
                                            <p style={{ fontSize: '0.6875rem', color: '#059669' }}>
                                                ✅ 100% resolution rate
                                            </p>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.75rem' }}>
                                                🛣️ CIVIL & ROADS
                                            </h4>
                                            <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                Roads, potholes, pavements
                                            </p>
                                            <p style={{ fontSize: '0.6875rem', color: '#059669' }}>
                                                ✅ 93% resolution rate
                                            </p>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.75rem' }}>
                                                💧 WATER & DRAINAGE
                                            </h4>
                                            <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                Water supply, drainage, sewage
                                            </p>
                                            <p style={{ fontSize: '0.6875rem', color: '#059669' }}>
                                                ✅ 92% resolution rate
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* ZONES with Dropdown & Interactive Map */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseEnter={() => setShowZonesDropdown(true)}
                                onMouseLeave={() => setShowZonesDropdown(false)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: showZonesDropdown ? 'rgba(247, 127, 0, 0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                ZONES
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Zones Dropdown Menu */}
                            {showZonesDropdown && (
                                <div 
                                    onMouseEnter={() => setShowZonesDropdown(true)}
                                    onMouseLeave={() => setShowZonesDropdown(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        backgroundColor: 'white',
                                        border: '2px solid #E3EEF7',
                                        borderTop: '3px solid #F77F00',
                                        borderRadius: '0 0 0.5rem 0.5rem',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        minWidth: '1200px',
                                        padding: '1.5rem',
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr',
                                        gap: '2rem'
                                    }}
                                >
                                    {/* Column 1: ZONE WISE INFORMATION */}
                                    <div>
                                        <h3 style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '700',
                                            color: '#1F4E78',
                                            marginBottom: '1rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #F77F00',
                                            paddingBottom: '0.5rem'
                                        }}>
                                            🗺️ ZONE WISE INFORMATION
                                        </h3>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {/* Zone 1 - North Zone */}
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#F5F7FA',
                                                border: '1px solid #E3EEF7',
                                                borderLeft: '3px solid #1F4E78',
                                                borderRadius: '0.375rem'
                                            }}>
                                                <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.75rem' }}>
                                                    📍 Zone 1 - North Zone
                                                </h4>
                                                <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Head Officer:</strong> Sh. Amit Kumar</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Area:</strong> 45.2 sq km</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Population:</strong> 8.5 lakhs</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Wards:</strong> 1-15</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Issues This Month:</strong> 47</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                        <span style={{ color: '#059669', fontWeight: '600' }}>Resolution: 92%</span>
                                                        <button style={{
                                                            fontSize: '0.625rem',
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#1F4E78',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}>
                                                            View Zone 1 Portal →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zone 2 - East Zone */}
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#F5F7FA',
                                                border: '1px solid #E3EEF7',
                                                borderLeft: '3px solid #F77F00',
                                                borderRadius: '0.375rem'
                                            }}>
                                                <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F77F00', marginBottom: '0.75rem' }}>
                                                    📍 Zone 2 - East Zone
                                                </h4>
                                                <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Head Officer:</strong> Smt. Priya Sharma</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Area:</strong> 52.8 sq km</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Population:</strong> 9.2 lakhs</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Wards:</strong> 16-32</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Issues This Month:</strong> 38</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                        <span style={{ color: '#059669', fontWeight: '600' }}>Resolution: 95% 🥇</span>
                                                        <button style={{
                                                            fontSize: '0.625rem',
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#F77F00',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}>
                                                            View Zone 2 Portal →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zone 3 - South Zone */}
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#F5F7FA',
                                                border: '1px solid #E3EEF7',
                                                borderLeft: '3px solid #2E7D32',
                                                borderRadius: '0.375rem'
                                            }}>
                                                <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#2E7D32', marginBottom: '0.75rem' }}>
                                                    📍 Zone 3 - South Zone
                                                </h4>
                                                <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Head Officer:</strong> Sh. Rajesh Gupta</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Area:</strong> 38.7 sq km</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Population:</strong> 7.8 lakhs</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Wards:</strong> 33-48</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Issues This Month:</strong> 52</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                        <span style={{ color: '#059669', fontWeight: '600' }}>Resolution: 89% 🥉</span>
                                                        <button style={{
                                                            fontSize: '0.625rem',
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#2E7D32',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}>
                                                            View Zone 3 Portal →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zone 4 - West Zone */}
                                            <div style={{
                                                padding: '1rem',
                                                backgroundColor: '#F5F7FA',
                                                border: '1px solid #E3EEF7',
                                                borderLeft: '3px solid #7C3AED',
                                                borderRadius: '0.375rem'
                                            }}>
                                                <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#7C3AED', marginBottom: '0.75rem' }}>
                                                    📍 Zone 4 - West Zone
                                                </h4>
                                                <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Head Officer:</strong> Sh. Vikram Singh</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Area:</strong> 41.3 sq km</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Population:</strong> 8.1 lakhs</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Wards:</strong> 49-64</p>
                                                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Issues This Month:</strong> 43</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                        <span style={{ color: '#059669', fontWeight: '600' }}>Resolution: 87%</span>
                                                        <button style={{
                                                            fontSize: '0.625rem',
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#7C3AED',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}>
                                                            View Zone 4 Portal →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Column 2: WARD LOCATOR & INTERACTIVE MAP */}
                                    <div>
                                        <h3 style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '700',
                                            color: '#1F4E78',
                                            marginBottom: '1rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '2px solid #F77F00',
                                            paddingBottom: '0.5rem'
                                        }}>
                                            🗺️ WARD LOCATOR
                                        </h3>

                                        {/* Interactive Map */}
                                        <div style={{
                                            height: '200px',
                                            backgroundColor: '#E5E7EB',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundImage: `
                                                radial-gradient(circle at 20% 30%, rgba(31, 78, 120, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 60% 70%, rgba(247, 127, 0, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 80% 40%, rgba(46, 125, 50, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 30% 80%, rgba(124, 58, 237, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 70% 20%, rgba(220, 38, 38, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 40% 50%, rgba(31, 78, 120, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 15% 60%, rgba(247, 127, 0, 0.8) 8px, transparent 9px),
                                                radial-gradient(circle at 85% 75%, rgba(46, 125, 50, 0.8) 8px, transparent 9px)
                                            `,
                                            backgroundSize: '100% 100%',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginBottom: '1rem',
                                            border: '2px solid #D1D5DB'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.transform = 'scale(1.02)';
                                            e.target.style.borderColor = '#F77F00';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.borderColor = '#D1D5DB';
                                        }}
                                        >
                                            <div style={{ 
                                                textAlign: 'center', 
                                                backgroundColor: 'rgba(255,255,255,0.95)', 
                                                padding: '1rem', 
                                                borderRadius: '0.375rem',
                                                border: '1px solid #E3EEF7'
                                            }}>
                                                <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '700', marginBottom: '0.5rem' }}>
                                                    🗺️ Interactive City Map
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500', marginBottom: '0.5rem' }}>
                                                    "Find your ward by clicking on map"
                                                </div>
                                                <div style={{ fontSize: '0.6875rem', color: '#1F4E78', fontWeight: '600' }}>
                                                    Shows: Ward number, Officer, Complaints
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#F0F9FF',
                                            border: '1px solid #BAE6FD',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            color: '#1F4E78',
                                            textAlign: 'center'
                                        }}>
                                            💡 <strong>Tip:</strong> Click on colored zones to get detailed ward information
                                        </div>
                                    </div>

                                    {/* Column 3: PERFORMANCE RANKINGS & ANNOUNCEMENTS */}
                                    <div>
                                        {/* Zone Performance Rankings */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem'
                                            }}>
                                                🏆 ZONE PERFORMANCE RANKINGS
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    backgroundColor: '#FEF3C7',
                                                    border: '2px solid #FDE68A',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <span style={{ fontSize: '1.5rem' }}>🥇</span>
                                                    <div>
                                                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#92400E' }}>
                                                            Zone 2: 95% resolution rate
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F3F4F6',
                                                    border: '2px solid #D1D5DB',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <span style={{ fontSize: '1.5rem' }}>🥈</span>
                                                    <div>
                                                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                                                            Zone 1: 92% resolution rate
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    backgroundColor: '#FEF2F2',
                                                    border: '2px solid #FECACA',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <span style={{ fontSize: '1.5rem' }}>🥉</span>
                                                    <div>
                                                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#991B1B' }}>
                                                            Zone 3: 89% resolution rate
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Zone Wise Announcements */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem'
                                            }}>
                                                📢 ZONE WISE ANNOUNCEMENTS
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderLeft: '3px solid #1F4E78',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.25rem' }}>
                                                        Zone 1 - North Zone
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        Water supply maintenance scheduled for Dec 16-17.
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#ECFDF5',
                                                    border: '1px solid #BBF7D0',
                                                    borderLeft: '3px solid #2E7D32',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2E7D32', marginBottom: '0.25rem' }}>
                                                        All Zones
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        Tree plantation drive starts Monday.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* CITIZEN CORNER with Dropdown - MOST IMPORTANT */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseEnter={() => setShowCitizenCornerDropdown(true)}
                                onMouseLeave={() => setShowCitizenCornerDropdown(false)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: showCitizenCornerDropdown ? 'rgba(247, 127, 0, 0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                CITIZEN CORNER
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Citizen Corner Mega Dropdown */}
                            {showCitizenCornerDropdown && (
                                <div 
                                    onMouseEnter={() => setShowCitizenCornerDropdown(true)}
                                    onMouseLeave={() => setShowCitizenCornerDropdown(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '-200px', // Offset to center better
                                        backgroundColor: 'white',
                                        border: '2px solid #E3EEF7',
                                        borderTop: '3px solid #F77F00',
                                        borderRadius: '0 0 0.5rem 0.5rem',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 1000,
                                        minWidth: '1400px',
                                        padding: '2rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: '2rem'
                                    }}
                                >
                                    {/* Column 1: HOW TO FILE & FILE NOW */}
                                    <div>
                                        {/* HOW TO FILE A COMPLAINT */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                📋 HOW TO FILE A COMPLAINT
                                            </h3>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                                                    Step-by-step guide with screenshots
                                                </div>
                                                <div style={{ fontSize: '0.6875rem', color: '#1B3A4B', lineHeight: '1.6' }}>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ backgroundColor: '#1F4E78', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: '600' }}>1</span>
                                                        Download GrievanceGenie App
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ backgroundColor: '#1F4E78', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: '600' }}>2</span>
                                                        Take Photo of Issue
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ backgroundColor: '#1F4E78', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: '600' }}>3</span>
                                                        Select Category
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ backgroundColor: '#1F4E78', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: '600' }}>4</span>
                                                        Submit
                                                    </div>
                                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ backgroundColor: '#1F4E78', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: '600' }}>5</span>
                                                        Track Status
                                                    </div>
                                                </div>
                                                <button style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem',
                                                    backgroundColor: '#DC2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    justifyContent: 'center'
                                                }}>
                                                    🎥 Video Tutorial (3:45 min)
                                                </button>
                                            </div>
                                        </div>

                                        {/* FILE YOUR COMPLAINT NOW */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#DC2626',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #DC2626',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                📝 FILE YOUR COMPLAINT NOW
                                            </h3>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                                                    Direct link to Report Issue
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#059669' }}>
                                                        <span>✅</span> Upload Image
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#059669' }}>
                                                        <span>✅</span> Voice Input (8+ languages)
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#059669' }}>
                                                        <span>✅</span> Auto-Fill via AI
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#059669' }}>
                                                        <span>✅</span> Submit & Get ID
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)'
                                            }}>
                                                🚨 REPORT ISSUE NOW
                                            </button>
                                        </div>
                                    </div>

                                    {/* Column 2: TRACK YOUR COMPLAINT & FAQ */}
                                    <div>
                                        {/* TRACK YOUR COMPLAINT */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                🔍 TRACK YOUR COMPLAINT
                                            </h3>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                                                    Real-time status tracking
                                                </div>
                                                
                                                {/* Tracking Input */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Complaint ID (e.g., GG-00001)"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '2px solid #E3EEF7',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem',
                                                            marginBottom: '0.5rem',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <button style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        backgroundColor: '#1F4E78',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.375rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}>
                                                        🔍 TRACK STATUS
                                                    </button>
                                                </div>

                                                {/* Status Examples */}
                                                <div style={{ fontSize: '0.6875rem', color: '#1B3A4B', lineHeight: '1.6' }}>
                                                    <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#1F4E78' }}>Status Examples:</div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: '#F59E0B' }}>🟡</span> Submitted & Under Review
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: '#3B82F6' }}>🔵</span> Assigned to Officer
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: '#8B5CF6' }}>🟣</span> Work in Progress
                                                    </div>
                                                    <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: '#059669' }}>🟢</span> Resolved & Closed
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* FAQ SECTION */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                ❓ FREQUENTLY ASKED QUESTIONS
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.25rem' }}>
                                                        Q: How long does it take to resolve?
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        A: Emergency issues: 24 hours, Normal: 7 days
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.25rem' }}>
                                                        Q: Can I upload multiple photos?
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        A: Yes, up to 5 photos per complaint
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.25rem' }}>
                                                        Q: Is my personal data safe?
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        A: Yes, we follow Government data protection standards
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: SUPPORT & HELP + CITIZEN CHARTER */}
                                    <div>
                                        {/* SUPPORT & HELP */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                🆘 SUPPORT & HELP
                                            </h3>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                                                    Multiple ways to get assistance
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {/* Phone Support */}
                                                    <div style={{
                                                        padding: '0.75rem',
                                                        backgroundColor: '#ECFDF5',
                                                        border: '1px solid #BBF7D0',
                                                        borderLeft: '3px solid #059669',
                                                        borderRadius: '0.375rem'
                                                    }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#059669', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            📞 Phone Support
                                                        </div>
                                                        <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                            Helpline: 1800-11-3344<br/>
                                                            Mon-Sat: 9 AM - 6 PM
                                                        </div>
                                                    </div>

                                                    {/* Email Support */}
                                                    <div style={{
                                                        padding: '0.75rem',
                                                        backgroundColor: '#FEF3C7',
                                                        border: '1px solid #FDE68A',
                                                        borderLeft: '3px solid #F59E0B',
                                                        borderRadius: '0.375rem'
                                                    }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#D97706', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            📧 Email Support
                                                        </div>
                                                        <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                            help@mcd.gov.in<br/>
                                                            Response within 24 hours
                                                        </div>
                                                    </div>

                                                    {/* WhatsApp Support */}
                                                    <div style={{
                                                        padding: '0.75rem',
                                                        backgroundColor: '#F0FDF4',
                                                        border: '1px solid #BBF7D0',
                                                        borderLeft: '3px solid #16A34A',
                                                        borderRadius: '0.375rem'
                                                    }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16A34A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            💬 WhatsApp Support
                                                        </div>
                                                        <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                            +91-98765-43210<br/>
                                                            Quick responses in Hindi/English
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CITIZEN CHARTER */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                📜 CITIZEN CHARTER
                                            </h3>
                                            
                                            <div style={{ fontSize: '0.6875rem', color: '#1B3A4B', lineHeight: '1.6' }}>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#1F4E78', marginBottom: '0.5rem' }}>Your Rights:</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Timely resolution of complaints</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Regular status updates</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Courteous treatment</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Appeal mechanism</div>
                                                </div>
                                                
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#1F4E78', marginBottom: '0.5rem' }}>Your Responsibilities:</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Provide accurate information</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Upload clear photos</div>
                                                    <div style={{ marginBottom: '0.25rem' }}>• Cooperate with officers</div>
                                                </div>

                                                <button style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    backgroundColor: '#1F4E78',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}>
                                                    📄 Download Full Charter (PDF)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 4: RATING & FEEDBACK + STATISTICS */}
                                    <div>
                                        {/* RATING & FEEDBACK */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                ⭐ RATING & FEEDBACK
                                            </h3>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                                                    Help us improve our services
                                                </div>
                                                
                                                {/* Current Ratings */}
                                                <div style={{
                                                    padding: '1rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderRadius: '0.375rem',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.75rem', textAlign: 'center' }}>
                                                        Current Service Rating
                                                    </div>
                                                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                                                        <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⭐⭐⭐⭐⭐</div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1F4E78' }}>4.2/5.0</div>
                                                        <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>Based on 2,847 reviews</div>
                                                    </div>
                                                </div>

                                                {/* Quick Feedback */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.5rem' }}>
                                                        Quick Feedback:
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                        <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer' }}>😊 Excellent</button>
                                                        <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer' }}>😐 Average</button>
                                                        <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer' }}>😞 Poor</button>
                                                    </div>
                                                </div>

                                                <button style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F77F00',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}>
                                                    📝 DETAILED FEEDBACK FORM
                                                </button>
                                            </div>
                                        </div>

                                        {/* GRIEVANCE STATISTICS */}
                                        <div>
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#1F4E78',
                                                marginBottom: '1rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '2px solid #F77F00',
                                                paddingBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                📊 GRIEVANCE STATISTICS
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* This Month Stats */}
                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#ECFDF5',
                                                    border: '1px solid #BBF7D0',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#059669', marginBottom: '0.5rem' }}>
                                                        📈 This Month (December 2025)
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span>Total Complaints:</span>
                                                            <span style={{ fontWeight: '600' }}>2,847</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span>Resolved:</span>
                                                            <span style={{ fontWeight: '600', color: '#059669' }}>2,612 (92%)</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Avg Resolution:</span>
                                                            <span style={{ fontWeight: '600' }}>2.1 days</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Category Breakdown */}
                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#F0F9FF',
                                                    border: '1px solid #BAE6FD',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.5rem' }}>
                                                        🏷️ Top Categories
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span>Streetlights:</span>
                                                            <span style={{ fontWeight: '600' }}>847</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span>Potholes:</span>
                                                            <span style={{ fontWeight: '600' }}>623</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span>Garbage:</span>
                                                            <span style={{ fontWeight: '600' }}>512</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Water Issues:</span>
                                                            <span style={{ fontWeight: '600' }}>398</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Accessibility Features */}
                                                <div style={{
                                                    padding: '0.75rem',
                                                    backgroundColor: '#FEF3C7',
                                                    border: '1px solid #FDE68A',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#D97706', marginBottom: '0.5rem' }}>
                                                        ♿ ACCESSIBILITY FEATURES
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: '1.4' }}>
                                                        <div style={{ marginBottom: '0.25rem' }}>• Voice input in 8+ languages</div>
                                                        <div style={{ marginBottom: '0.25rem' }}>• Screen reader compatible</div>
                                                        <div style={{ marginBottom: '0.25rem' }}>• High contrast mode</div>
                                                        <div>• Large text options</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* CTA Button */}
                    <button style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#F77F00',
                        color: 'white',
                        border: '2px solid #F77F00',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#F77F00';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#F77F00';
                        e.target.style.color = 'white';
                    }}
                    >
                        ONLINE SERVICES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GovernmentHeader;