import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGPS } from '../../hooks/useGPS';
import { analyzeImage, analyzeVoiceTranscript } from '../../services/aiService';
import { submitComplaint } from '../../services/complaintService';
import apiService from '../../services/api';
import CameraCapture from '../../components/ReportIssue/CameraCapture';
import AIResults from '../../components/ReportIssue/AIResults';
import VoiceRecorder from '../../components/ReportIssue/VoiceRecorder';
import PinDropMap from '../../components/ReportIssue/PinDropMap';
import ManualForm from '../../components/ReportIssue/ManualForm';
import ImageValidationStep from '../../components/ReportIssue/ImageValidationStep';
import ExtractedIssueForm from '../../components/ReportIssue/ExtractedIssueForm';
import SuccessModal from '../../components/ReportIssue/SuccessModal';

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const { location, error: gpsError } = useGPS();
    
    const [currentStep, setCurrentStep] = useState('camera'); // 'camera' | 'validation' | 'ai_processing' | 'ai_results' | 'extracted_form' | 'voice' | 'manual' | 'success'
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [submittedComplaint, setSubmittedComplaint] = useState(null);

    // Debug current step (after state declarations)
    console.log('🎬 Current step:', currentStep);
    console.log('🎬 aiAnalysis exists:', !!aiAnalysis);
    console.log('🎬 validationResult exists:', !!validationResult);

    const handlePhotoCapture = async (photoData) => {
        setCapturedPhoto(photoData);
        // Go to validation step first
        setCurrentStep('validation');
    };

    const handleValidationComplete = async (result) => {
        setValidationResult(result);
        
        // Check if we have extracted data from vision analysis (even if rejected)
        console.log('🔍 Validation result:', result);
        console.log('🔍 Extracted data:', result.extracted_data);
        console.log('🔍 Vision analysis:', result.vision_analysis);
        console.log('🔍 GPS coordinates:', result.gps_coordinates);
        console.log('🔍 GPS address:', result.gps_address);
        console.log('🔍 Full EXIF:', result.full_exif);
        console.log('🔍 Full EXIF GPS:', result.full_exif?.gps);
        
        // DEBUG: Check what condition we're hitting
        console.log('🔍 Has vision_analysis?', !!result.vision_analysis);
        console.log('🔍 Has extracted_data?', !!result.extracted_data);
        console.log('🔍 Has extracted_issue_data?', !!result.extracted_issue_data);
        console.log('🔍 Status:', result.status);
        console.log('🔍 All result keys:', Object.keys(result));
        
        // ALWAYS show ExtractedIssueForm for accepted images (like we had working before)
        if (result.status === 'accepted') {
            console.log('✅ IMAGE ACCEPTED: Going to ExtractedIssueForm (as implemented in TASK 5)');
            
            // Create analysis object with available data (fallback to defaults if vision analysis failed)
            const extractedData = result.extracted_data || result.extracted_issue_data || {};
            const visionData = result.vision_analysis || {};
            
            const analysis = {
                category: extractedData.category || _mapVisionToUserCategory(visionData.issue_type_detected) || 'others',
                severity: extractedData.severity || _mapVisionSeverity(visionData.severity) || 'Medium',
                description: extractedData.description || visionData.visual_summary || 'Issue detected in uploaded image',
                detected_objects: extractedData.detected_objects || visionData.detected_objects || [],
                confidence: extractedData.confidence || visionData.confidence_score || 75, // Default confidence
                location: result.gps_coordinates ? {
                    lat: result.gps_coordinates.latitude,
                    lng: result.gps_coordinates.longitude,
                    address: result.gps_address || 
                             `${result.gps_coordinates.latitude.toFixed(4)}°N, ${result.gps_coordinates.longitude.toFixed(4)}°E`
                } : (result.full_exif?.gps_coordinates ? {
                    lat: result.full_exif.gps_coordinates.latitude,
                    lng: result.full_exif.gps_coordinates.longitude,
                    address: result.full_exif.gps_address || 
                             `${result.full_exif.gps_coordinates.latitude.toFixed(4)}°N, ${result.full_exif.gps_coordinates.longitude.toFixed(4)}°E`
                } : location || { lat: 28.6139, lng: 77.2090 }), // Default coordinates
                vision_analysis: result.vision_analysis,
                forensics_analysis: result.forensics_analysis,
                validation_status: result.status
            };
            
            console.log('📋 Final analysis object:', analysis);
            setAiAnalysis(analysis);
            setCurrentStep('extracted_form');  // FORCE ExtractedIssueForm (as we had working)
            console.log('✅ SET STEP TO: extracted_form');
        } else if (false) { // Disable the old fallback logic
            console.log('⚠️ FALLBACK: No vision data, going to old AI analysis');
            // Fallback to old AI analysis if vision data not available
            setCurrentStep('ai_processing');
            setIsProcessing(true);

            try {
                const analysis = await analyzeImage(capturedPhoto, location);
                setAiAnalysis(analysis);
                setCurrentStep('ai_results');
                console.log('⚠️ FALLBACK: Set step to ai_results');
            } catch (error) {
                console.error('AI Analysis failed:', error);
                setCurrentStep('manual');
                console.log('❌ ERROR: Set step to manual');
            } finally {
                setIsProcessing(false);
            }
        } else {
            console.log('❌ REJECTED: No vision data and rejected, going to manual');
            // Image rejected and no extracted data - go to manual form
            setCurrentStep('manual');
        }
    };

    const handleVoiceTranscript = async (transcript) => {
        setIsProcessing(true);
        try {
            const analysis = await analyzeVoiceTranscript(transcript);
            // Merge voice analysis with existing or create new
            setAiAnalysis(prev => ({
                ...prev,
                ...analysis.extractedInfo,
                category: analysis.category,
                severity: analysis.severity,
                description: transcript,
                location: location || { lat: 12.9234, lng: 77.5678 }
            }));
            setCurrentStep('ai_results');
        } catch (error) {
            console.error('Voice analysis failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitFromExtracted = async (formData) => {
        setIsProcessing(true);
        try {
            console.log('📤 Submitting complaint with officer auto-assignment...');
            console.log('Form data:', formData);
            console.log('Captured photo:', capturedPhoto);
            
            // Convert base64 data URL to File object
            let imageFile = null;
            if (capturedPhoto) {
                // Handle base64 data URL
                if (typeof capturedPhoto === 'string' && capturedPhoto.startsWith('data:')) {
                    const response = await fetch(capturedPhoto);
                    const blob = await response.blob();
                    imageFile = new File([blob], 'complaint_image.jpg', { type: 'image/jpeg' });
                    console.log('📷 Converted base64 to File:', imageFile);
                } else if (capturedPhoto instanceof File) {
                    imageFile = capturedPhoto;
                } else if (capturedPhoto?.file) {
                    imageFile = capturedPhoto.file;
                }
            }
            
            // Prepare complaint data for new API
            const complaintData = {
                citizenName: formData.citizenName,
                citizenPhone: formData.citizenPhone || null,
                category: formData.category,
                severity: formData.severity,
                description: formData.description,
                ward: formData.ward || 12, // Use ward from form or default to 12
                location: aiAnalysis.location?.address || `${aiAnalysis.location?.lat}, ${aiAnalysis.location?.lng}`,
                latitude: aiAnalysis.location?.lat || location?.lat || 12.9234,
                longitude: aiAnalysis.location?.lng || location?.lng || 77.5678,
                image: imageFile, // Pass the converted File object
                validation_record_id: validationResult?.validation_id || null
            };

            console.log('📤 Complaint data prepared:', complaintData);
            console.log('📤 Image file:', imageFile);
            
            // Call new complaint creation API with officer auto-assignment
            const result = await apiService.createComplaint(complaintData);
            
            console.log('✅ Complaint created successfully:', result);
            
            // Set complaint data for SuccessModal
            setSubmittedComplaint(result);
            setCurrentStep('success');
        } catch (error) {
            console.error('❌ Complaint submission failed:', error);
            alert('Failed to submit complaint. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const _mapVisionToUserCategory = (visionCategory) => {
        const mapping = {
            "streetlight": "electricity",
            "garbage": "garbage",
            "pothole": "roads",
            "water_leak": "water",
            "sewage_overflow": "drainage",
            "road_damage": "roads",
            "drain_block": "drainage",
            "public_safety_other": "others",
            "unknown": "others"
        };
        return mapping[visionCategory] || "others";
    };

    const _mapVisionSeverity = (visionSeverity) => {
        const mapping = {
            "LOW": "Low",
            "MEDIUM": "Medium", 
            "HIGH": "High"
        };
        return mapping[visionSeverity] || "Medium";
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

    const handleSubmitFromAI = async () => {
        setIsProcessing(true);
        try {
            const payload = {
                category: aiAnalysis.category,
                description: aiAnalysis.description,
                severity: aiAnalysis.severity,
                location: aiAnalysis.location,
                photoBase64: capturedPhoto,
                timestamp: new Date().toISOString()
            };

            const result = await submitComplaint(payload);
            setSubmittedComplaint(result);
            setCurrentStep('success');
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit complaint. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSubmit = async (formData) => {
        setIsProcessing(true);
        try {
            const payload = {
                ...formData,
                location: location || { lat: 12.9234, lng: 77.5678 },
                photoBase64: capturedPhoto,
                timestamp: new Date().toISOString()
            };

            const result = await submitComplaint(payload);
            setSubmittedComplaint(result);
            setCurrentStep('success');
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit complaint. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Camera Step
    if (currentStep === 'camera') {
        return (
            <CameraCapture
                onCapture={handlePhotoCapture}
                onClose={() => navigate('/dashboard')}
            />
        );
    }

    // Validation Step
    if (currentStep === 'validation' && capturedPhoto) {
        return (
            <ImageValidationStep
                photoData={capturedPhoto}
                onValidationComplete={handleValidationComplete}
                onRetake={() => setCurrentStep('camera')}
            />
        );
    }

    // AI Processing Step
    if (currentStep === 'ai_processing') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>✨</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Analyzing your photo...</h2>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>AI is detecting the issue type and severity</p>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Extracted Issue Form Step (NEW)
    if (currentStep === 'extracted_form' && aiAnalysis) {
        console.log('🎯 Rendering ExtractedIssueForm with:', aiAnalysis);
        console.log('🔍 Validation result for forensics:', validationResult);
        console.log('🎬 Current step confirmed: extracted_form');
        return (
            <ExtractedIssueForm
                extractedData={aiAnalysis}
                visionAnalysis={aiAnalysis.vision_analysis}
                forensicsAnalysis={aiAnalysis.forensics_analysis}
                onSubmit={handleSubmitFromExtracted}
                onRetake={() => setCurrentStep('camera')}
                onEdit={() => setCurrentStep('manual')}
            />
        );
    }

    // AI Results Step
    if (currentStep === 'ai_results' && aiAnalysis) {
        return (
            <AIResults
                analysis={aiAnalysis}
                onSubmit={handleSubmitFromAI}
                onRetake={() => setCurrentStep('camera')}
                onEdit={() => setCurrentStep('manual')}
            />
        );
    }

    // Voice Step
    if (currentStep === 'voice') {
        return (
            <VoiceRecorder
                onTranscriptComplete={handleVoiceTranscript}
            />
        );
    }

    // Manual Step
    if (currentStep === 'manual') {
        return (
            <ManualForm
                initialData={aiAnalysis}
                onSubmit={handleManualSubmit}
                onCancel={() => navigate('/dashboard')}
            />
        );
    }

    // Success Step - Show SuccessModal with complaint ID and assigned officer
    if (currentStep === 'success' && submittedComplaint) {
        console.log('🎉 Rendering SuccessModal with complaint data:', submittedComplaint);
        return <SuccessModal complaintData={submittedComplaint} />;
    }

    // Debug fallback
    console.log('🚨 Fallback reached - currentStep:', currentStep, 'aiAnalysis:', aiAnalysis);
    
    // Fallback
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
            <div style={{ textAlign: 'center' }}>
                <p>Loading...</p>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>Step: {currentStep}</p>
            </div>
        </div>
    );
};

export default ReportIssuePage;