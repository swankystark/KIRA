import React, { useState } from 'react';
import { CheckCircle, Edit3, MapPin, AlertTriangle, Eye, Brain, Shield, Camera, MessageSquare, Monitor, Navigation, Target } from 'lucide-react';
import { WARDS, suggestWard } from '../../data/wards';

const ExtractedIssueForm = ({ extractedData, visionAnalysis, forensicsAnalysis, onSubmit, onEdit, onRetake }) => {
    console.log('🎯 ExtractedIssueForm COMPONENT RENDERING!');
    console.log('  extractedData:', extractedData);
    console.log('  extractedData.category:', extractedData?.category);
    console.log('  extractedData.description:', extractedData?.description);
    console.log('  visionAnalysis:', visionAnalysis);
    console.log('  forensicsAnalysis:', forensicsAnalysis);
    console.log('  forensicsAnalysis.source_type:', forensicsAnalysis?.source_type);
    const [formData, setFormData] = useState({
        category: extractedData?.category || 'others',
        severity: extractedData?.severity || 'Medium',
        description: extractedData?.description || '',
        citizenName: '',
        citizenPhone: '',
        ward: suggestWard(extractedData?.location?.address) || 12, // Auto-suggest or default to 12
        location: extractedData?.location || '',
        // NEW REQUIRED FIELDS
        confirmedLatitude: '',
        confirmedLongitude: '',
        locationLabel: '',
        affectedAreaType: '',
        issueDuration: '',
        // VISIBILITY & ACCESSIBILITY (checkboxes)
        blockingTraffic: false,
        blockingPedestrians: false,
        causingBadSmell: false,
        nearSchoolHospital: false,
        openToPublicView: false
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    
    // Check if we need location picker (WhatsApp/Screenshot - prioritize forensics over EXIF)
    const needsLocationPicker = () => {
        // Debug logging
        console.log('🔍 needsLocationPicker check:');
        console.log('  forensicsAnalysis:', forensicsAnalysis);
        console.log('  source_type:', forensicsAnalysis?.source_type);
        
        // If forensics detected WhatsApp or Screenshot, always show location picker
        // regardless of EXIF GPS data (which could be misleading for screenshots)
        const isWhatsAppOrScreenshot = forensicsAnalysis && 
            (forensicsAnalysis.source_type === 'WHATSAPP_IMAGE' || 
             forensicsAnalysis.source_type === 'SCREENSHOT_IMAGE');
        
        console.log('  isWhatsAppOrScreenshot:', isWhatsAppOrScreenshot);
        
        // For WhatsApp/Screenshots, we want user to confirm location manually
        // because EXIF GPS in screenshots/forwarded images may not represent the actual issue location
        return isWhatsAppOrScreenshot;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.citizenName.trim()) {
            alert('Please enter your name');
            return;
        }
        
        // Validate confirmed location (CRITICAL for screenshots)
        if (!formData.confirmedLatitude || !formData.confirmedLongitude) {
            alert('Please confirm the exact location coordinates where this issue exists.');
            return;
        }
        
        // Validate affected area type (REQUIRED)
        if (!formData.affectedAreaType) {
            alert('Please select the affected area type (Road, Footpath, Park, etc.)');
            return;
        }
        
        // Validate issue duration (REQUIRED)
        if (!formData.issueDuration) {
            alert('Please specify how long this issue has existed');
            return;
        }
        
        // Validate location for WhatsApp/Screenshots
        if (needsLocationPicker() && extractedData.location?.source !== 'user_current_location') {
            const imageType = forensicsAnalysis?.source_type === 'WHATSAPP_IMAGE' ? 'WhatsApp' : 'screenshot';
            alert(`Please verify your location by clicking "Use Current Location" since this is a ${imageType} image. The GPS data may not represent the actual issue location.`);
            return;
        }
        
        onSubmit(formData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Get current location from browser
    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = {
                    lat: latitude,
                    lng: longitude,
                    address: `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E`,
                    source: 'user_current_location'
                };
                
                // Update the extracted data location
                extractedData.location = newLocation;
                handleInputChange('location', newLocation);
                
                // Auto-fill confirmed coordinates
                handleInputChange('confirmedLatitude', latitude.toString());
                handleInputChange('confirmedLongitude', longitude.toString());
                
                setIsGettingLocation(false);
                
                console.log('📍 User location obtained:', newLocation);
            },
            (error) => {
                console.error('Error getting location:', error);
                let errorMessage = 'Unable to get your location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access and try again.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                
                alert(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // Open map picker (placeholder for future implementation)
    const openMapPicker = () => {
        setIsLocationPickerOpen(true);
        // For now, just get current location
        // In future, this could open a map interface
        getCurrentLocation();
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'garbage': '🗑️',
            'roads': '🛣️',
            'water': '💧',
            'drainage': '🚰',
            'electricity': '💡',
            'infrastructure': '🏗️',
            'others': '⚠️'
        };
        return icons[category] || '📋';
    };

    const getCategoryName = (category) => {
        const names = {
            'garbage': 'Garbage Issue',
            'roads': 'Road Issue',
            'water': 'Water Issue',
            'drainage': 'Drainage Issue',
            'electricity': 'Electricity Issue',
            'infrastructure': 'Infrastructure Issue',
            'others': 'Other Issue'
        };
        return names[category] || 'Civic Issue';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'High': { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
            'Medium': { bg: '#FFFBEB', color: '#D97706', border: '#FED7AA' },
            'Low': { bg: '#ECFDF5', color: '#059669', border: '#BBF7D0' }
        };
        return colors[severity] || colors.Medium;
    };

    // Helper functions for forensics display
    const getSourceIcon = (sourceType) => {
        const iconProps = { className: "w-5 h-5 flex-shrink-0" };
        switch (sourceType) {
            case 'ORIGINAL_PHONE_PHOTO':
                return <Camera {...iconProps} style={{ color: '#059669' }} />;
            case 'WHATSAPP_IMAGE':
                return <MessageSquare {...iconProps} style={{ color: '#0891B2' }} />;
            case 'SCREENSHOT_IMAGE':
                return <Monitor {...iconProps} style={{ color: '#7C3AED' }} />;
            default:
                return <Shield {...iconProps} style={{ color: '#6B7280' }} />;
        }
    };

    const getSourceDisplayName = (sourceType) => {
        const names = {
            'ORIGINAL_PHONE_PHOTO': 'Original Phone Photo',
            'WHATSAPP_IMAGE': 'WhatsApp Image',
            'SCREENSHOT_IMAGE': 'Screenshot Image',
            'UNKNOWN': 'Unknown Source'
        };
        return names[sourceType] || 'Unknown Source';
    };

    const getSourceDescription = (sourceType) => {
        const descriptions = {
            'ORIGINAL_PHONE_PHOTO': 'This appears to be an original photo taken directly with a camera. Highest authenticity verification.',
            'WHATSAPP_IMAGE': 'This appears to be a WhatsApp forwarded image. While acceptable for reporting, original photos provide better verification.',
            'SCREENSHOT_IMAGE': 'This appears to be a screenshot. While acceptable for reporting, original photos of the issue provide better verification.',
            'UNKNOWN': 'The image source could not be determined with high confidence.'
        };
        return descriptions[sourceType] || 'Image source analysis completed.';
    };

    const getSourceBackgroundColor = (sourceType) => {
        const colors = {
            'ORIGINAL_PHONE_PHOTO': '#ECFDF5',  // Green
            'WHATSAPP_IMAGE': '#F0F9FF',        // Blue
            'SCREENSHOT_IMAGE': '#FAF5FF',      // Purple
            'UNKNOWN': '#F9FAFB'                // Gray
        };
        return colors[sourceType] || '#F9FAFB';
    };

    const getSourceBorderColor = (sourceType) => {
        const colors = {
            'ORIGINAL_PHONE_PHOTO': '#BBF7D0',  // Green
            'WHATSAPP_IMAGE': '#BAE6FD',        // Blue
            'SCREENSHOT_IMAGE': '#E9D5FF',      // Purple
            'UNKNOWN': '#E5E7EB'                // Gray
        };
        return colors[sourceType] || '#E5E7EB';
    };

    const getSourceTextColor = (sourceType) => {
        const colors = {
            'ORIGINAL_PHONE_PHOTO': '#059669',  // Green
            'WHATSAPP_IMAGE': '#0891B2',        // Blue
            'SCREENSHOT_IMAGE': '#7C3AED',      // Purple
            'UNKNOWN': '#6B7280'                // Gray
        };
        return colors[sourceType] || '#6B7280';
    };

    const getAuthenticityStatus = (sourceType) => {
        const statuses = {
            'ORIGINAL_PHONE_PHOTO': 'Highest Authenticity',
            'WHATSAPP_IMAGE': 'Acceptable Source',
            'SCREENSHOT_IMAGE': 'Acceptable Source',
            'UNKNOWN': 'Authenticity Unclear'
        };
        return statuses[sourceType] || 'Authenticity Unclear';
    };

    const getAuthenticityColor = (sourceType) => {
        const colors = {
            'ORIGINAL_PHONE_PHOTO': '#059669',  // Green
            'WHATSAPP_IMAGE': '#0891B2',        // Blue
            'SCREENSHOT_IMAGE': '#7C3AED',      // Purple
            'UNKNOWN': '#6B7280'                // Gray
        };
        return colors[sourceType] || '#6B7280';
    };

    // Auto-fill helper functions based on AI analysis
    const getSmartAffectedAreaType = () => {
        const description = extractedData?.description?.toLowerCase() || '';
        const detectedObjects = extractedData?.detected_objects || [];
        
        // Smart detection based on description and objects
        if (description.includes('road') || description.includes('street') || detectedObjects.includes('road')) {
            return 'road_street';
        }
        if (description.includes('footpath') || description.includes('sidewalk') || description.includes('pavement')) {
            return 'footpath';
        }
        if (description.includes('park') || description.includes('garden') || detectedObjects.includes('park')) {
            return 'public_park';
        }
        if (description.includes('residential') || description.includes('house') || description.includes('apartment')) {
            return 'residential_area';
        }
        if (description.includes('shop') || description.includes('market') || description.includes('commercial')) {
            return 'commercial_area';
        }
        if (description.includes('government') || description.includes('office') || description.includes('municipal')) {
            return 'government_property';
        }
        return ''; // Let user choose
    };

    const getSmartVisibilityFlags = () => {
        const description = extractedData?.description?.toLowerCase() || '';
        const detectedObjects = extractedData?.detected_objects || [];
        
        return {
            blockingTraffic: description.includes('road') && (description.includes('block') || description.includes('obstruct')),
            blockingPedestrians: description.includes('footpath') || description.includes('sidewalk'),
            causingBadSmell: extractedData?.category === 'garbage' || description.includes('smell') || description.includes('waste'),
            nearSchoolHospital: description.includes('school') || description.includes('hospital') || description.includes('clinic'),
            openToPublicView: true // Most civic issues are in public view
        };
    };

    // Initialize smart defaults on component mount
    React.useEffect(() => {
        console.log('🤖 Auto-fill useEffect triggered with extractedData:', extractedData);
        
        const smartAreaType = getSmartAffectedAreaType();
        const smartVisibility = getSmartVisibilityFlags();
        
        console.log('🤖 Smart area type:', smartAreaType);
        console.log('🤖 Smart visibility:', smartVisibility);
        
        if (smartAreaType) {
            console.log('🤖 Setting area type to:', smartAreaType);
            setFormData(prev => ({ ...prev, affectedAreaType: smartAreaType }));
        }
        
        setFormData(prev => ({ 
            ...prev, 
            ...smartVisibility,
            // Auto-fill confirmed location if GPS available
            confirmedLatitude: extractedData?.location?.lat?.toString() || '',
            confirmedLongitude: extractedData?.location?.lng?.toString() || ''
        }));
        
        console.log('🤖 Auto-fill completed');
    }, [extractedData]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#F5F7FA', // Government background
            padding: '1rem'
        }}>
            {/* Government Header Banner */}
            <div style={{
                backgroundColor: '#1F4E78', // Government Blue
                color: 'white',
                padding: '0.75rem 0',
                marginBottom: '1rem',
                borderBottom: '3px solid #F77F00' // Government Orange accent
            }}>
                <div style={{ 
                    maxWidth: '600px', 
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0 1rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F77F00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            margin: 0,
                            color: 'white'
                        }}>
                            Unified Municipal Platform
                        </h1>
                        <p style={{ 
                            fontSize: '0.875rem', 
                            margin: 0,
                            opacity: 0.9
                        }}>
                            Citizen Grievance Portal • AI Analysis Complete
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ 
                maxWidth: '600px', 
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '0.5rem', // Less rounded for government look
                boxShadow: '0 4px 12px rgba(31, 78, 120, 0.1)', // Government blue shadow
                border: '1px solid #E3EEF7',
                overflow: 'hidden'
            }}>
                {/* Status Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1F4E78 0%, #153456 100%)', // Government blue gradient
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'white',
                    borderBottom: '3px solid #F77F00' // Orange accent
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'rgba(247, 127, 0, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        marginBottom: '1rem'
                    }}>
                        <CheckCircle className="w-5 h-5" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            VERIFIED & ANALYZED
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Issue Report Ready for Submission
                    </h2>
                    <p style={{ opacity: 0.9, fontSize: '0.8125rem' }}>
                        AI Confidence: {extractedData?.confidence || 0}% • Please review and confirm details
                    </p>
                </div>

                {/* AI Analysis Summary - Government Style */}
                {visionAnalysis && (
                    <div style={{ 
                        padding: '1.5rem', 
                        backgroundColor: '#E3EEF7', // Government blue light
                        borderBottom: '1px solid #C7DDEE',
                        borderLeft: '4px solid #1F4E78' // Government blue accent
                    }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                            <div style={{
                                backgroundColor: '#1F4E78',
                                borderRadius: '0.375rem',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600', 
                                    color: '#1B3A4B', // Government text color
                                    margin: '0 0 0.5rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em'
                                }}>
                                    AI ANALYSIS REPORT
                                </h3>
                                <p style={{ 
                                    fontSize: '0.8125rem', 
                                    color: '#1F4E78',
                                    margin: '0 0 0.75rem 0',
                                    lineHeight: '1.5',
                                    fontWeight: '500'
                                }}>
                                    {visionAnalysis.visual_summary}
                                </p>
                                {visionAnalysis.detected_objects && visionAnalysis.detected_objects.length > 0 && (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        backgroundColor: 'rgba(247, 127, 0, 0.1)',
                                        padding: '0.5rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(247, 127, 0, 0.2)'
                                    }}>
                                        <Eye className="w-4 h-4 text-orange-600" />
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1B3A4B',
                                            fontWeight: '500'
                                        }}>
                                            Objects Detected: {visionAnalysis.detected_objects.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {/* Issue Type - Government Style */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B', // Government text
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }}>
                            ISSUE CATEGORY
                        </label>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            padding: '1rem',
                            backgroundColor: '#F5F7FA', // Government background
                            borderRadius: '0.375rem',
                            border: '2px solid #E3EEF7',
                            borderLeft: '4px solid #1F4E78' // Government blue accent
                        }}>
                            <div style={{
                                backgroundColor: '#1F4E78',
                                borderRadius: '0.5rem',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '3rem',
                                minHeight: '3rem'
                            }}>
                                <span style={{ fontSize: '1.5rem', filter: 'brightness(0) invert(1)' }}>
                                    {getCategoryIcon(formData.category)}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #C7DDEE',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            backgroundColor: 'white',
                                            color: '#1B3A4B',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <option value="garbage">🗑️ Garbage Issue</option>
                                        <option value="roads">🛣️ Road Issue</option>
                                        <option value="water">💧 Water Issue</option>
                                        <option value="drainage">🚰 Drainage Issue</option>
                                        <option value="electricity">💡 Electricity Issue</option>
                                        <option value="infrastructure">🏗️ Infrastructure Issue</option>
                                        <option value="others">📋 Other Issue</option>
                                    </select>
                                ) : (
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: '#1B3A4B',
                                            fontSize: '1rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {getCategoryName(formData.category)}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1F4E78',
                                            fontWeight: '500'
                                        }}>
                                            AI Detected Category
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#F77F00', // Government orange
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Severity Level - Government Style */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }}>
                            PRIORITY LEVEL
                        </label>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            padding: '1rem',
                            backgroundColor: getSeverityColor(formData.severity).bg,
                            borderRadius: '0.375rem',
                            border: `2px solid ${getSeverityColor(formData.severity).border}`,
                            borderLeft: `4px solid ${getSeverityColor(formData.severity).color}`
                        }}>
                            <div style={{
                                backgroundColor: getSeverityColor(formData.severity).color,
                                borderRadius: '0.5rem',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <select
                                        value={formData.severity}
                                        onChange={(e) => handleInputChange('severity', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #C7DDEE',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            backgroundColor: 'white',
                                            color: '#1B3A4B',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <option value="Low">🟢 Low Priority</option>
                                        <option value="Medium">🟡 Medium Priority</option>
                                        <option value="High">🔴 High Priority</option>
                                    </select>
                                ) : (
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: getSeverityColor(formData.severity).color,
                                            fontSize: '1rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {formData.severity.toUpperCase()} PRIORITY
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1F4E78',
                                            fontWeight: '500'
                                        }}>
                                            AI Assessed Priority Level
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description - Government Style */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }}>
                            ISSUE DESCRIPTION
                        </label>
                        <div style={{
                            border: '2px solid #E3EEF7',
                            borderRadius: '0.375rem',
                            borderLeft: '4px solid #1F4E78'
                        }}>
                            <div style={{
                                backgroundColor: '#E3EEF7',
                                padding: '0.5rem 0.75rem',
                                borderBottom: '1px solid #C7DDEE',
                                fontSize: '0.75rem',
                                color: '#1F4E78',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                AI Generated Description
                            </div>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: 'none',
                                    borderRadius: '0 0 0.375rem 0.375rem',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    backgroundColor: 'white',
                                    color: '#1B3A4B',
                                    lineHeight: '1.5',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#1F4E78',
                            marginTop: '0.25rem',
                            fontWeight: '500'
                        }}>
                            You can edit this AI-generated description if needed
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Location
                        </label>
                        
                        {/* Location Display */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'start', 
                            gap: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: needsLocationPicker() ? '#FEF3C7' : '#F0F9FF',
                            borderRadius: '0.5rem',
                            border: `1px solid ${needsLocationPicker() ? '#FDE68A' : '#BAE6FD'}`,
                            marginBottom: needsLocationPicker() ? '0.75rem' : '0'
                        }}>
                            <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${needsLocationPicker() ? 'text-yellow-600' : 'text-blue-600'}`} />
                            <div style={{ flex: 1 }}>
                                {needsLocationPicker() ? (
                                    <>
                                        <div style={{ fontWeight: '500', color: '#92400E', marginBottom: '0.25rem' }}>
                                            Location Verification Required
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#92400E', marginBottom: '0.5rem' }}>
                                            {forensicsAnalysis?.source_type === 'WHATSAPP_IMAGE' 
                                                ? 'WhatsApp forwarded image detected'
                                                : 'Screenshot image detected'
                                            }
                                        </div>
                                        {extractedData.location?.lat && extractedData.location?.lng && extractedData.location.source !== 'user_current_location' && (
                                            <div style={{ 
                                                fontSize: '0.6875rem', 
                                                color: '#6B7280',
                                                padding: '0.375rem',
                                                backgroundColor: 'rgba(255,255,255,0.7)',
                                                borderRadius: '0.25rem',
                                                fontFamily: 'monospace'
                                            }}>
                                                ⚠️ Found GPS: {extractedData.location.lat.toFixed(6)}°N, {extractedData.location.lng.toFixed(6)}°E
                                                <br />
                                                <span style={{ fontFamily: 'inherit', fontSize: '0.625rem' }}>
                                                    (May not represent actual issue location)
                                                </span>
                                            </div>
                                        )}
                                        {extractedData.location?.source === 'user_current_location' && (
                                            <div style={{ 
                                                fontSize: '0.6875rem', 
                                                color: '#059669',
                                                marginTop: '0.25rem',
                                                fontWeight: '500'
                                            }}>
                                                ✓ Current location obtained: {extractedData.location.lat.toFixed(6)}°N, {extractedData.location.lng.toFixed(6)}°E
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: '500', color: '#1E40AF', marginBottom: '0.25rem' }}>
                                            {extractedData.location?.address || 'GPS Location'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                                            {extractedData.location?.lat?.toFixed(6)}°N, {extractedData.location?.lng?.toFixed(6)}°E
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Location Picker Buttons (only for WhatsApp/Screenshots without GPS) */}
                        {needsLocationPicker() && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '0.5rem',
                                padding: '0.75rem',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '0.5rem',
                                border: '1px solid #E5E7EB'
                            }}>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={isGettingLocation}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        backgroundColor: isGettingLocation ? '#F3F4F6' : '#10B981',
                                        color: isGettingLocation ? '#6B7280' : 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isGettingLocation ? (
                                        <>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                border: '2px solid #D1D5DB',
                                                borderTop: '2px solid #6B7280',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            Getting Location...
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="w-4 h-4" />
                                            Use Current Location
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={openMapPicker}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Target className="w-4 h-4" />
                                    Pick on Map
                                </button>
                            </div>
                        )}
                        
                        {/* Helper Text */}
                        {needsLocationPicker() && (
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#6B7280',
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '0.375rem',
                                border: '1px solid #E5E7EB'
                            }}>
                                💡 <strong>Why location verification is needed:</strong> {
                                    forensicsAnalysis?.source_type === 'WHATSAPP_IMAGE' 
                                        ? 'WhatsApp forwarded images may contain GPS data from when/where the original photo was taken, not where the issue currently exists.'
                                        : 'Screenshots may contain GPS data from the device, but this may not represent the actual location of the issue shown in the image.'
                                } Please confirm the exact location where this issue exists.
                            </div>
                        )}
                    </div>

                    {/* 1️⃣ CONFIRMED LOCATION (MANDATORY) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            📍 Confirmed Exact Location *
                        </label>
                        
                        <div style={{ 
                            padding: '1rem',
                            backgroundColor: '#FFF4E6', // Government orange light
                            borderRadius: '0.375rem',
                            border: '2px solid #FDC8A7',
                            borderLeft: '4px solid #F77F00', // Government orange
                            marginBottom: '0.75rem'
                        }}>
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#8B4C00', 
                                marginBottom: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                ⚠️ CRITICAL REQUIREMENT: Confirm the exact coordinates where this issue exists. 
                                Municipal field workers will use these coordinates to locate and resolve the problem.
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block' }}>
                                        Latitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.confirmedLatitude}
                                        onChange={(e) => handleInputChange('confirmedLatitude', e.target.value)}
                                        placeholder="12.345678"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #C7DDEE',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'white',
                                            color: '#1B3A4B',
                                            fontWeight: '600'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block' }}>
                                        Longitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.confirmedLongitude}
                                        onChange={(e) => handleInputChange('confirmedLongitude', e.target.value)}
                                        placeholder="77.123456"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #C7DDEE',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'white',
                                            color: '#1B3A4B',
                                            fontWeight: '600'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block' }}>
                                    Location Label (Optional but Recommended)
                                </label>
                                <input
                                    type="text"
                                    value={formData.locationLabel}
                                    onChange={(e) => handleInputChange('locationLabel', e.target.value)}
                                    placeholder="e.g., Near Gandhi Nagar Bus Stop, Ward 12, Zone C"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2️⃣ AFFECTED AREA TYPE (MANDATORY) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            🏷️ Affected Area Type *
                        </label>
                        
                        <select
                            value={formData.affectedAreaType}
                            onChange={(e) => handleInputChange('affectedAreaType', e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #C7DDEE',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                backgroundColor: formData.affectedAreaType ? '#E3EEF7' : 'white',
                                color: '#1B3A4B',
                                fontWeight: '500'
                            }}
                        >
                            <option value="">Select affected area type...</option>
                            <option value="road_street">🛣️ Road / Street</option>
                            <option value="footpath">🚶 Footpath / Sidewalk</option>
                            <option value="public_park">🌳 Public Park / Garden</option>
                            <option value="residential_area">🏠 Residential Area</option>
                            <option value="commercial_area">🏪 Commercial Area / Market</option>
                            <option value="government_property">🏛️ Government Property</option>
                            <option value="other">📋 Other</option>
                        </select>
                        
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                            Helps determine department routing and priority level
                        </div>
                    </div>

                    {/* 3️⃣ ISSUE VISIBILITY & ACCESSIBILITY */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            👁️ Issue Impact & Visibility
                        </label>
                        
                        <div style={{ 
                            padding: '1rem',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '0.5rem',
                            border: '1px solid #E5E7EB'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                                Select all that apply (helps determine severity and priority):
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {[
                                    { key: 'blockingTraffic', label: '🚗 Blocking Traffic', color: '#DC2626' },
                                    { key: 'blockingPedestrians', label: '🚶 Blocking Pedestrians', color: '#D97706' },
                                    { key: 'causingBadSmell', label: '👃 Causing Bad Smell', color: '#7C2D12' },
                                    { key: 'nearSchoolHospital', label: '🏥 Near School/Hospital', color: '#B91C1C' },
                                    { key: 'openToPublicView', label: '👀 Open to Public View', color: '#059669' }
                                ].map(({ key, label, color }) => (
                                    <label key={key} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: formData[key] ? `${color}15` : 'white',
                                        borderRadius: '0.375rem',
                                        border: `1px solid ${formData[key] ? color : '#E5E7EB'}`,
                                        cursor: 'pointer',
                                        fontSize: '0.8125rem',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData[key]}
                                            onChange={(e) => handleInputChange(key, e.target.checked)}
                                            style={{ accentColor: color }}
                                        />
                                        <span style={{ color: formData[key] ? color : '#374151' }}>
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4️⃣ ISSUE DURATION (CRITICAL) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            ⏰ How Long Has This Issue Existed? *
                        </label>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '0.5rem',
                            padding: '1rem',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '0.5rem',
                            border: '1px solid #FDE68A'
                        }}>
                            {[
                                { value: 'today', label: '📅 Today', severity: 'low', color: '#059669' },
                                { value: '1_3_days', label: '📆 1-3 Days', severity: 'medium', color: '#D97706' },
                                { value: '3_7_days', label: '📋 3-7 Days', severity: 'high', color: '#DC2626' },
                                { value: 'more_than_week', label: '⚠️ More than a Week', severity: 'critical', color: '#991B1B' }
                            ].map(({ value, label, severity, color }) => (
                                <label key={value} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    backgroundColor: formData.issueDuration === value ? `${color}15` : 'white',
                                    borderRadius: '0.375rem',
                                    border: `2px solid ${formData.issueDuration === value ? color : '#E5E7EB'}`,
                                    cursor: 'pointer',
                                    fontSize: '0.8125rem',
                                    fontWeight: formData.issueDuration === value ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="radio"
                                        name="issueDuration"
                                        value={value}
                                        checked={formData.issueDuration === value}
                                        onChange={(e) => handleInputChange('issueDuration', e.target.value)}
                                        style={{ accentColor: color }}
                                    />
                                    <span style={{ color: formData.issueDuration === value ? color : '#374151' }}>
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        
                        <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.5rem' }}>
                            <strong>Critical for escalation:</strong> Older issues get higher priority and faster resolution
                        </div>
                    </div>

                    {/* Image Source Verification */}
                    {forensicsAnalysis && forensicsAnalysis.source_type && forensicsAnalysis.source_type !== 'UNKNOWN' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '0.875rem', 
                                fontWeight: '600', 
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Image Source Verification
                            </label>
                            <div style={{ 
                                padding: '1rem',
                                backgroundColor: getSourceBackgroundColor(forensicsAnalysis.source_type),
                                borderRadius: '0.5rem',
                                border: `1px solid ${getSourceBorderColor(forensicsAnalysis.source_type)}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                                    {getSourceIcon(forensicsAnalysis.source_type)}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{ 
                                                fontWeight: '600', 
                                                color: getSourceTextColor(forensicsAnalysis.source_type),
                                                fontSize: '0.875rem'
                                            }}>
                                                {getSourceDisplayName(forensicsAnalysis.source_type)}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.75rem',
                                                color: '#6B7280',
                                                backgroundColor: 'rgba(255,255,255,0.7)',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '0.25rem',
                                                fontWeight: '500'
                                            }}>
                                                {Math.round((forensicsAnalysis.confidence_score || 0) * 100)}% confidence
                                            </span>
                                        </div>
                                        
                                        <p style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#4B5563',
                                            margin: '0 0 0.5rem 0',
                                            lineHeight: '1.4'
                                        }}>
                                            {getSourceDescription(forensicsAnalysis.source_type)}
                                        </p>
                                        
                                        {/* Authenticity Status */}
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.375rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <Shield className="w-3 h-3" style={{ color: getAuthenticityColor(forensicsAnalysis.source_type) }} />
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: '500',
                                                color: getAuthenticityColor(forensicsAnalysis.source_type)
                                            }}>
                                                {getAuthenticityStatus(forensicsAnalysis.source_type)}
                                            </span>
                                        </div>
                                        
                                        {/* Camera Info (if available) */}
                                        {forensicsAnalysis.source_type === 'ORIGINAL_PHONE_PHOTO' && extractedData.camera_info && (
                                            <div style={{ 
                                                fontSize: '0.6875rem', 
                                                color: '#6B7280',
                                                fontFamily: 'monospace',
                                                backgroundColor: 'rgba(255,255,255,0.5)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                marginTop: '0.25rem'
                                            }}>
                                                📷 {extractedData.camera_info.make} {extractedData.camera_info.model}
                                            </div>
                                        )}
                                        
                                        {/* Evidence Summary (for debugging/transparency) */}
                                        {forensicsAnalysis.evidence && forensicsAnalysis.evidence.length > 0 && (
                                            <details style={{ marginTop: '0.5rem' }}>
                                                <summary style={{ 
                                                    fontSize: '0.6875rem', 
                                                    color: '#6B7280',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}>
                                                    Technical Details
                                                </summary>
                                                <div style={{ 
                                                    fontSize: '0.625rem', 
                                                    color: '#6B7280',
                                                    marginTop: '0.25rem',
                                                    paddingLeft: '0.5rem',
                                                    borderLeft: '2px solid #E5E7EB'
                                                }}>
                                                    {forensicsAnalysis.evidence.slice(0, 3).map((evidence, index) => (
                                                        <div key={index}>• {evidence}</div>
                                                    ))}
                                                    {forensicsAnalysis.evidence.length > 3 && (
                                                        <div>• ... and {forensicsAnalysis.evidence.length - 3} more</div>
                                                    )}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Citizen Details */}
                    <div style={{ 
                        padding: '1rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '1rem'
                        }}>
                            Your Details
                        </h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '0.75rem', 
                                fontWeight: '500', 
                                color: '#6B7280',
                                marginBottom: '0.25rem'
                            }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.citizenName}
                                onChange={(e) => handleInputChange('citizenName', e.target.value)}
                                placeholder="Enter your full name"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '0.75rem', 
                                fontWeight: '500', 
                                color: '#6B7280',
                                marginBottom: '0.25rem'
                            }}>
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                value={formData.citizenPhone}
                                onChange={(e) => handleInputChange('citizenPhone', e.target.value)}
                                placeholder="Enter your phone number"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions - Government Style */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.75rem',
                        padding: '1.5rem',
                        backgroundColor: '#F5F7FA',
                        borderTop: '2px solid #E3EEF7',
                        margin: '0 -1.5rem -1.5rem -1.5rem'
                    }}>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                background: 'linear-gradient(135deg, #1F4E78 0%, #153456 100%)', // Government blue gradient
                                color: 'white',
                                border: '2px solid #1F4E78',
                                borderRadius: '0.375rem',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(31, 78, 120, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(31, 78, 120, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(31, 78, 120, 0.3)';
                            }}
                        >
                            <CheckCircle className="w-5 h-5" />
                            SUBMIT OFFICIAL COMPLAINT
                        </button>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={onEdit}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    backgroundColor: 'white',
                                    color: '#1F4E78',
                                    border: '2px solid #1F4E78',
                                    borderRadius: '0.375rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#1F4E78';
                                    e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#1F4E78';
                                }}
                            >
                                <Edit3 className="w-4 h-4" />
                                EDIT DETAILS
                            </button>
                            <button
                                type="button"
                                onClick={onRetake}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    backgroundColor: 'white',
                                    color: '#F77F00',
                                    border: '2px solid #F77F00',
                                    borderRadius: '0.375rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#F77F00';
                                    e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#F77F00';
                                }}
                            >
                                <Camera className="w-4 h-4" />
                                RETAKE PHOTO
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* CSS for loading animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ExtractedIssueForm;