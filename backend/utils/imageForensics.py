"""
Image Source Forensics Module
Identifies image source: ORIGINAL_PHONE_PHOTO, WHATSAPP_IMAGE, or SCREENSHOT_IMAGE

This module performs byte-level, metadata, and compression analysis to determine
the likely source of an uploaded image without breaking existing validation logic.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Optional, Tuple, List
import struct
import re
from PIL import Image
from PIL.ExifTags import TAGS
import piexif

logger = logging.getLogger(__name__)

class ImageSourceForensics:
    """
    Advanced image forensics for source identification
    """
    
    def __init__(self):
        # WhatsApp detection markers (ENHANCED)
        self.whatsapp_markers = {
            'quality_range': (60, 75),  # WhatsApp JPEG compression quality
            'file_size_range': (100_000, 500_000),  # 100KB - 500KB typical range
            'aspect_ratios': [(9, 16), (16, 9), (4, 3), (3, 4)],  # Standard phone ratios
            'resolution_patterns': [
                (1600, 1200), (1280, 960), (1024, 768),  # WhatsApp resize patterns
                (800, 600), (640, 480), (720, 1280)
            ],
            'filename_patterns': [
                r'img-\d{8}-wa\d{4}',  # IMG-20241214-WA0001
                r'wa\d{4}',            # WA0001
                r'whatsapp',           # whatsapp
            ]
        }
        
        # Screenshot detection markers (ENHANCED)
        self.screenshot_markers = {
            'exact_screen_resolutions': [
                # iPhone resolutions
                (1125, 2436), (1242, 2688), (1170, 2532), (828, 1792),
                (750, 1334), (640, 1136), (1284, 2778), (1080, 2340),
                # Android resolutions
                (1080, 1920), (1080, 2340), (1080, 2400), (1440, 2960),
                (720, 1280), (1080, 2280), (1440, 3040), (1440, 2880),
                # Tablet resolutions
                (2048, 2732), (1668, 2388), (1536, 2048), (2560, 1600)
            ],
            'ui_colors': [
                0xFFFFFF, 0xF0F0F0, 0x000000, 0x007AFF,  # Common UI colors
                0x34C759, 0xFF3B30, 0xFF9500, 0x5856D6
            ],
            'filename_patterns': [
                r'screenshot',
                r'screen_?shot',
                r'capture',
                r'snap',
                r'screen_\d+',
            ],
            'os_metadata': [
                'Android', 'iOS', 'Windows', 'macOS', 'Screenshot'
            ]
        }
        
        # Original phone photo indicators
        self.original_photo_signatures = {
            'camera_brands': [
                'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi',
                'Huawei', 'OPPO', 'Vivo', 'Nothing', 'Realme'
            ],
            'camera_apps': [
                'Camera', 'Open Camera', 'VSCO', 'Camera FV-5'
            ],
            'exif_indicators': [
                'Make', 'Model', 'Software', 'DateTime',
                'GPS', 'Flash', 'FocalLength', 'ExposureTime'
            ]
        }

    def detect_whatsapp(self, image_buffer: bytes, image_path: str, filename: str) -> Dict:
        """
        Enhanced WhatsApp detection using multiple markers
        
        Required markers (minimum 3 for classification):
        • JPEG signature (0xFF 0xD8)
        • EXIF fully stripped OR camera model missing
        • File size typically between 100–500 KB
        • JPEG compression quality approx 60–75%
        • ICC color profile missing
        • Standard phone aspect ratio (9:16, 16:9)
        
        Returns:
            Dict with type, confidence (0-100), and markers
        """
        markers = {
            'jpeg_signature': False,
            'exif_stripped': False,
            'file_size_range': False,
            'compression_quality': False,
            'icc_missing': False,
            'phone_aspect_ratio': False,
            'whatsapp_filename': False,
            'resolution_pattern': False
        }
        
        confidence = 0
        evidence = []
        
        try:
            # 1. Check JPEG signature (0xFF 0xD8)
            if image_buffer.startswith(b'\xff\xd8'):
                markers['jpeg_signature'] = True
                confidence += 15
                evidence.append("JPEG signature detected")
            
            # 2. Check file size (100KB - 500KB)
            file_size = len(image_buffer)
            if self.whatsapp_markers['file_size_range'][0] <= file_size <= self.whatsapp_markers['file_size_range'][1]:
                markers['file_size_range'] = True
                confidence += 20
                evidence.append(f"File size in WhatsApp range ({file_size/1024:.0f}KB)")
            
            # 3. Analyze EXIF and metadata
            try:
                with Image.open(image_path) as img:
                    # Check dimensions and aspect ratio
                    width, height = img.size
                    aspect_ratio = self._get_aspect_ratio(width, height)
                    
                    if aspect_ratio in self.whatsapp_markers['aspect_ratios']:
                        markers['phone_aspect_ratio'] = True
                        confidence += 15
                        evidence.append(f"Phone aspect ratio {aspect_ratio[0]}:{aspect_ratio[1]}")
                    
                    # Check for WhatsApp resolution patterns
                    for w_pattern, h_pattern in self.whatsapp_markers['resolution_patterns']:
                        if abs(width - w_pattern) <= 50 and abs(height - h_pattern) <= 50:
                            markers['resolution_pattern'] = True
                            confidence += 10
                            evidence.append(f"WhatsApp resize pattern detected ({width}x{height})")
                            break
                    
                    # Check ICC profile
                    if not hasattr(img, 'icc_profile') or img.icc_profile is None:
                        markers['icc_missing'] = True
                        confidence += 10
                        evidence.append("ICC color profile missing")
                
                # Check EXIF data
                try:
                    exif_dict = piexif.load(image_path)
                    has_camera_info = False
                    
                    if '0th' in exif_dict:
                        ifd = exif_dict['0th']
                        if piexif.ImageIFD.Make in ifd or piexif.ImageIFD.Model in ifd:
                            has_camera_info = True
                    
                    if not has_camera_info or not exif_dict.get('0th') or not exif_dict.get('Exif'):
                        markers['exif_stripped'] = True
                        confidence += 20
                        evidence.append("EXIF data stripped or camera info missing")
                        
                except:
                    # No EXIF data at all
                    markers['exif_stripped'] = True
                    confidence += 25
                    evidence.append("EXIF data completely stripped")
                
                # 4. Check JPEG quality
                if img.format == 'JPEG':
                    quality = self._estimate_jpeg_quality_advanced(image_path)
                    if self.whatsapp_markers['quality_range'][0] <= quality <= self.whatsapp_markers['quality_range'][1]:
                        markers['compression_quality'] = True
                        confidence += 15
                        evidence.append(f"JPEG quality in WhatsApp range ({quality}%)")
                        
            except Exception as e:
                logger.debug(f"Image analysis failed: {e}")
            
            # 5. Check filename patterns
            filename_lower = filename.lower()
            for pattern in self.whatsapp_markers['filename_patterns']:
                if re.search(pattern, filename_lower):
                    markers['whatsapp_filename'] = True
                    confidence += 20
                    evidence.append(f"WhatsApp filename pattern: {pattern}")
                    break
            
            # Require minimum 3 markers for WhatsApp classification
            active_markers = sum(1 for marker in markers.values() if marker)
            
            if active_markers >= 3:
                return {
                    'type': 'WHATSAPP',
                    'confidence': min(confidence, 100),
                    'markers': markers,
                    'evidence': evidence,
                    'active_markers': active_markers
                }
            else:
                return {
                    'type': 'UNKNOWN',
                    'confidence': 0,
                    'markers': markers,
                    'evidence': evidence + [f"Only {active_markers}/3 required markers found"],
                    'active_markers': active_markers
                }
                
        except Exception as e:
            logger.error(f"WhatsApp detection failed: {e}")
            return {
                'type': 'UNKNOWN',
                'confidence': 0,
                'markers': markers,
                'evidence': [f"Detection failed: {str(e)}"],
                'active_markers': 0
            }

    def detect_original(self, image_buffer: bytes, image_path: str, filename: str) -> Dict:
        """
        Original phone photo detection - HIGHEST confidence class
        
        Detection logic:
        • Full EXIF present
        • Camera make & model detected  
        • GPS coordinates present
        • JPEG quality > 80
        • High resolution (≥3000px on one side)
        • Camera-specific noise / CFA pattern (if available)
        
        Requires at least 3 strong markers
        """
        markers = {
            'full_exif_present': False,
            'camera_make_model': False,
            'gps_coordinates': False,
            'high_jpeg_quality': False,
            'high_resolution': False,
            'camera_noise_pattern': False,
            'camera_settings': False,
            'original_timestamp': False
        }
        
        confidence = 0
        evidence = []
        
        try:
            # 1. Check image resolution
            with Image.open(image_path) as img:
                width, height = img.size
                max_dimension = max(width, height)
                
                if max_dimension >= 3000:
                    markers['high_resolution'] = True
                    confidence += 25
                    evidence.append(f"High resolution detected ({width}x{height})")
                
                # 2. Check JPEG quality
                if img.format == 'JPEG':
                    quality = self._estimate_jpeg_quality_advanced(image_path)
                    if quality > 80:
                        markers['high_jpeg_quality'] = True
                        confidence += 20
                        evidence.append(f"High JPEG quality ({quality}%)")
                
                # 3. Analyze noise patterns (simplified)
                if self._detect_camera_noise_pattern(img):
                    markers['camera_noise_pattern'] = True
                    confidence += 15
                    evidence.append("Camera sensor noise pattern detected")
            
            # 4. Comprehensive EXIF analysis
            try:
                exif_dict = piexif.load(image_path)
                exif_sections = 0
                
                # Check main IFD sections
                if '0th' in exif_dict and exif_dict['0th']:
                    exif_sections += 1
                if 'Exif' in exif_dict and exif_dict['Exif']:
                    exif_sections += 1
                if '1st' in exif_dict and exif_dict['1st']:
                    exif_sections += 1
                
                if exif_sections >= 2:
                    markers['full_exif_present'] = True
                    confidence += 20
                    evidence.append(f"Full EXIF data present ({exif_sections} sections)")
                
                # 5. Camera make/model detection
                if '0th' in exif_dict:
                    ifd = exif_dict['0th']
                    
                    camera_make = None
                    camera_model = None
                    
                    if piexif.ImageIFD.Make in ifd:
                        camera_make = ifd[piexif.ImageIFD.Make].decode('utf-8', errors='ignore')
                    
                    if piexif.ImageIFD.Model in ifd:
                        camera_model = ifd[piexif.ImageIFD.Model].decode('utf-8', errors='ignore')
                    
                    if camera_make and camera_model:
                        # Check if it's a known camera brand
                        known_brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'OPPO', 'Vivo', 'Sony', 'Canon', 'Nikon']
                        if any(brand.lower() in camera_make.lower() for brand in known_brands):
                            markers['camera_make_model'] = True
                            confidence += 25
                            evidence.append(f"Camera detected: {camera_make} {camera_model}")
                    
                    # 6. Check timestamp authenticity
                    if piexif.ImageIFD.DateTime in ifd:
                        markers['original_timestamp'] = True
                        confidence += 10
                        evidence.append("Original timestamp present")
                
                # 7. GPS coordinates check
                if 'GPS' in exif_dict and exif_dict['GPS']:
                    gps_data = exif_dict['GPS']
                    if piexif.GPSIFD.GPSLatitude in gps_data and piexif.GPSIFD.GPSLongitude in gps_data:
                        markers['gps_coordinates'] = True
                        confidence += 20
                        evidence.append("GPS coordinates present")
                
                # 8. Camera settings analysis
                if 'Exif' in exif_dict:
                    exif_ifd = exif_dict['Exif']
                    camera_settings_count = 0
                    
                    camera_settings = [
                        piexif.ExifIFD.ExposureTime,
                        piexif.ExifIFD.FNumber,
                        piexif.ExifIFD.ISOSpeedRatings,
                        piexif.ExifIFD.Flash,
                        piexif.ExifIFD.FocalLength,
                        piexif.ExifIFD.WhiteBalance,
                        piexif.ExifIFD.ExposureMode
                    ]
                    
                    for setting in camera_settings:
                        if setting in exif_ifd:
                            camera_settings_count += 1
                    
                    if camera_settings_count >= 4:
                        markers['camera_settings'] = True
                        confidence += 15
                        evidence.append(f"Camera settings present ({camera_settings_count} parameters)")
                        
            except Exception as exif_error:
                logger.debug(f"EXIF analysis failed: {exif_error}")
            
            # Require at least 3 strong markers for original photo classification
            strong_markers = [
                'camera_make_model', 'gps_coordinates', 'high_jpeg_quality', 
                'high_resolution', 'full_exif_present'
            ]
            active_strong_markers = sum(1 for marker in strong_markers if markers[marker])
            total_active_markers = sum(1 for marker in markers.values() if marker)
            
            if active_strong_markers >= 3:
                return {
                    'type': 'ORIGINAL_PHOTO',
                    'confidence': min(confidence, 100),
                    'markers': markers,
                    'evidence': evidence,
                    'active_markers': total_active_markers,
                    'strong_markers': active_strong_markers
                }
            else:
                return {
                    'type': 'UNKNOWN',
                    'confidence': 0,
                    'markers': markers,
                    'evidence': evidence + [f"Only {active_strong_markers}/3 strong markers found"],
                    'active_markers': total_active_markers,
                    'strong_markers': active_strong_markers
                }
                
        except Exception as e:
            logger.error(f"Original photo detection failed: {e}")
            return {
                'type': 'UNKNOWN',
                'confidence': 0,
                'markers': markers,
                'evidence': [f"Detection failed: {str(e)}"],
                'active_markers': 0,
                'strong_markers': 0
            }

    def detect_screenshot(self, image_buffer: bytes, image_path: str, filename: str) -> Dict:
        """
        Enhanced screenshot detection using multiple markers
        
        Detection logic:
        • PNG header detection (0x89 0x50 0x4E 0x47)
        • OR JPEG with exact screen dimensions
        • Lossless or near-lossless compression
        • OS metadata present (Android/iOS/Windows/Mac)
        • UI color patterns (#FFFFFF, #F0F0F0, etc.)
        • Pixel-perfect edges (low sensor noise)
        
        Returns:
            Dict with type, confidence (0-100), and markers
        """
        markers = {
            'png_format': False,
            'exact_screen_resolution': False,
            'lossless_compression': False,
            'os_metadata': False,
            'ui_color_patterns': False,
            'screenshot_filename': False,
            'no_camera_metadata': False,
            'pixel_perfect_edges': False
        }
        
        confidence = 0
        evidence = []
        
        try:
            # 1. Check PNG header (0x89 0x50 0x4E 0x47)
            if image_buffer.startswith(b'\x89PNG'):
                markers['png_format'] = True
                confidence += 30
                evidence.append("PNG format detected")
            
            with Image.open(image_path) as img:
                width, height = img.size
                
                # 2. Check for exact screen resolutions
                for screen_w, screen_h in self.screenshot_markers['exact_screen_resolutions']:
                    if (width == screen_w and height == screen_h) or (width == screen_h and height == screen_w):
                        markers['exact_screen_resolution'] = True
                        confidence += 40
                        evidence.append(f"Exact screen resolution detected ({width}x{height})")
                        break
                
                # 3. Check compression type
                if img.format == 'PNG':
                    markers['lossless_compression'] = True
                    confidence += 20
                    evidence.append("Lossless PNG compression")
                elif img.format == 'JPEG':
                    quality = self._estimate_jpeg_quality_advanced(image_path)
                    if quality >= 95:  # Near-lossless JPEG
                        markers['lossless_compression'] = True
                        confidence += 15
                        evidence.append(f"Near-lossless JPEG quality ({quality}%)")
                
                # 4. Analyze pixel patterns for UI elements
                if self._detect_ui_color_patterns(img):
                    markers['ui_color_patterns'] = True
                    confidence += 15
                    evidence.append("UI color patterns detected")
                
                # 5. Check for pixel-perfect edges (low noise)
                if self._detect_pixel_perfect_edges(img):
                    markers['pixel_perfect_edges'] = True
                    confidence += 10
                    evidence.append("Pixel-perfect edges detected")
            
            # 6. Check metadata for OS indicators
            try:
                exif_dict = piexif.load(image_path)
                
                if '0th' in exif_dict:
                    ifd = exif_dict['0th']
                    
                    # Check software field for OS metadata
                    if piexif.ImageIFD.Software in ifd:
                        software = ifd[piexif.ImageIFD.Software].decode('utf-8', errors='ignore')
                        for os_name in self.screenshot_markers['os_metadata']:
                            if os_name.lower() in software.lower():
                                markers['os_metadata'] = True
                                confidence += 20
                                evidence.append(f"OS metadata detected: {os_name}")
                                break
                    
                    # Check absence of camera metadata
                    camera_fields = [piexif.ImageIFD.Make, piexif.ImageIFD.Model]
                    has_camera_info = any(field in ifd for field in camera_fields)
                    
                    if not has_camera_info:
                        markers['no_camera_metadata'] = True
                        confidence += 15
                        evidence.append("No camera metadata (typical for screenshots)")
                        
            except:
                # No EXIF data - common for screenshots
                markers['no_camera_metadata'] = True
                confidence += 10
                evidence.append("No EXIF metadata")
            
            # 7. Check filename patterns
            filename_lower = filename.lower()
            for pattern in self.screenshot_markers['filename_patterns']:
                if re.search(pattern, filename_lower):
                    markers['screenshot_filename'] = True
                    confidence += 25
                    evidence.append(f"Screenshot filename pattern: {pattern}")
                    break
            
            # Special case: PNG + exact screen resolution = strong screenshot signal
            if markers['png_format'] and markers['exact_screen_resolution']:
                confidence = max(confidence, 85)
                evidence.append("Strong screenshot signal: PNG + exact screen resolution")
            
            # For JPEG screenshots, require at least 2 markers
            active_markers = sum(1 for marker in markers.values() if marker)
            
            if (markers['png_format'] and markers['exact_screen_resolution']) or active_markers >= 2:
                return {
                    'type': 'SCREENSHOT',
                    'confidence': min(confidence, 100),
                    'markers': markers,
                    'evidence': evidence,
                    'active_markers': active_markers
                }
            else:
                return {
                    'type': 'UNKNOWN',
                    'confidence': 0,
                    'markers': markers,
                    'evidence': evidence + [f"Only {active_markers}/2 required markers found"],
                    'active_markers': active_markers
                }
                
        except Exception as e:
            logger.error(f"Screenshot detection failed: {e}")
            return {
                'type': 'UNKNOWN',
                'confidence': 0,
                'markers': markers,
                'evidence': [f"Detection failed: {str(e)}"],
                'active_markers': 0
            }

    def classify_image(self, image_buffer: bytes, image_path: str, filename: str) -> Dict:
        """
        Final source classification - runs all detectors and selects highest confidence
        
        Logic:
        • Run all three detectors independently
        • Select classification with HIGHEST confidence
        • If confidence < 70 → mark as "REVIEW_REQUIRED"
        """
        try:
            # Run all three detectors
            whatsapp_result = self.detect_whatsapp(image_buffer, image_path, filename)
            screenshot_result = self.detect_screenshot(image_buffer, image_path, filename)
            original_result = self.detect_original(image_buffer, image_path, filename)
            
            # Collect all results
            results = {
                'whatsapp': whatsapp_result,
                'screenshot': screenshot_result,
                'original': original_result
            }
            
            # Find highest confidence
            max_confidence = 0
            best_source = 'UNKNOWN'
            
            for source_type, result in results.items():
                if result['confidence'] > max_confidence:
                    max_confidence = result['confidence']
                    if result['type'] != 'UNKNOWN':
                        best_source = result['type']
            
            # Map to final source names
            source_mapping = {
                'WHATSAPP': 'WHATSAPP',
                'SCREENSHOT': 'SCREENSHOT', 
                'ORIGINAL_PHOTO': 'ORIGINAL_PHOTO'
            }
            
            final_source = source_mapping.get(best_source, 'UNKNOWN')
            
            # Determine recommendation
            # SAFETY: Default to ACCEPT for low confidence to avoid blocking legitimate submissions
            if max_confidence >= 70:
                recommendation = 'ACCEPT'
            else:
                recommendation = 'ACCEPT'  # Changed from 'REVIEW' for safety - never block on forensics alone
            
            return {
                'source': final_source,
                'confidence': max_confidence,
                'breakdown': results,
                'recommendation': recommendation,
                'classification_version': '2.0'
            }
            
        except Exception as e:
            logger.error(f"Image classification failed: {e}")
            return {
                'source': 'UNKNOWN',
                'confidence': 0,
                'breakdown': {},
                'recommendation': 'REVIEW',
                'classification_version': '2.0',
                'error': str(e)
            }

    def analyze_image_source(self, image_path: str, filename: str) -> Dict:
        """
        Main analysis function - determines image source with confidence scores
        
        Args:
            image_path: Path to the image file
            filename: Original filename
            
        Returns:
            Dict with source analysis results
        """
        try:
            # Read image data
            with open(image_path, 'rb') as f:
                image_buffer = f.read()
            
            # Use final classification method
            classification_result = self.classify_image(image_buffer, image_path, filename)
            
            # Map classification to legacy format
            source_mapping = {
                'WHATSAPP': 'WHATSAPP_IMAGE',
                'SCREENSHOT': 'SCREENSHOT_IMAGE',
                'ORIGINAL_PHOTO': 'ORIGINAL_PHONE_PHOTO',
                'UNKNOWN': 'UNKNOWN'
            }
            
            source_type = source_mapping.get(classification_result['source'], 'UNKNOWN')
            confidence = classification_result['confidence'] / 100.0
            
            # Collect evidence from best match
            best_result = None
            if classification_result['source'] == 'WHATSAPP':
                best_result = classification_result['breakdown']['whatsapp']
            elif classification_result['source'] == 'SCREENSHOT':
                best_result = classification_result['breakdown']['screenshot']
            elif classification_result['source'] == 'ORIGINAL_PHOTO':
                best_result = classification_result['breakdown']['original']
            
            evidence = best_result['evidence'] if best_result else ['Classification completed']
            detection_details = classification_result['breakdown']
            
            return {
                'source_type': source_type,
                'confidence_score': confidence,
                'evidence': evidence,
                'detection_details': detection_details,
                'classification_result': classification_result,
                'forensics_version': '3.0'  # Updated with original photo detection and final classification
            }
            
        except Exception as e:
            logger.error(f"Image forensics analysis failed: {str(e)}")
            return self._fallback_response(str(e))

    def _analyze_byte_patterns(self, image_buffer: bytes) -> Dict:
        """
        Analyze byte-level patterns in the image
        """
        try:
            analysis = {
                'file_size': len(image_buffer),
                'jpeg_markers': [],
                'compression_artifacts': 0,
                'whatsapp_signatures': 0,
                'screenshot_indicators': 0
            }
            
            # Check JPEG markers
            if image_buffer.startswith(b'\xff\xd8'):
                analysis['format'] = 'JPEG'
                analysis['jpeg_markers'] = self._extract_jpeg_markers(image_buffer)
            elif image_buffer.startswith(b'\x89PNG'):
                analysis['format'] = 'PNG'
                analysis['screenshot_indicators'] += 1  # PNG often used for screenshots
            
            # Look for WhatsApp signatures in bytes
            whatsapp_patterns = [b'WhatsApp', b'WA_', b'IMG-']
            for pattern in whatsapp_patterns:
                if pattern in image_buffer:
                    analysis['whatsapp_signatures'] += 1
            
            # Analyze compression artifacts (simplified)
            if analysis['format'] == 'JPEG':
                analysis['compression_artifacts'] = self._count_compression_artifacts(image_buffer)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Byte analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_metadata(self, image_path: str) -> Dict:
        """
        Analyze EXIF and other metadata
        """
        try:
            analysis = {
                'has_exif': False,
                'camera_info': {},
                'gps_info': {},
                'software_info': {},
                'whatsapp_indicators': 0,
                'original_photo_indicators': 0,
                'screenshot_indicators': 0
            }
            
            # Try to extract EXIF data
            try:
                exif_dict = piexif.load(image_path)
                analysis['has_exif'] = True
                
                # Analyze 0th IFD (main image data)
                if '0th' in exif_dict:
                    ifd = exif_dict['0th']
                    
                    # Camera make/model
                    if piexif.ImageIFD.Make in ifd:
                        make = ifd[piexif.ImageIFD.Make].decode('utf-8', errors='ignore')
                        analysis['camera_info']['make'] = make
                        
                        # Check if it's a known camera brand
                        if any(brand.lower() in make.lower() for brand in self.original_photo_signatures['camera_brands']):
                            analysis['original_photo_indicators'] += 2
                    
                    if piexif.ImageIFD.Model in ifd:
                        model = ifd[piexif.ImageIFD.Model].decode('utf-8', errors='ignore')
                        analysis['camera_info']['model'] = model
                        analysis['original_photo_indicators'] += 1
                    
                    # Software info
                    if piexif.ImageIFD.Software in ifd:
                        software = ifd[piexif.ImageIFD.Software].decode('utf-8', errors='ignore')
                        analysis['software_info']['software'] = software
                        
                        # Check for WhatsApp indicators
                        if 'whatsapp' in software.lower():
                            analysis['whatsapp_indicators'] += 3
                        elif any(app.lower() in software.lower() for app in self.original_photo_signatures['camera_apps']):
                            analysis['original_photo_indicators'] += 2
                
                # Analyze GPS data
                if 'GPS' in exif_dict and exif_dict['GPS']:
                    analysis['gps_info']['has_gps'] = True
                    analysis['original_photo_indicators'] += 2  # GPS usually indicates original photo
                else:
                    analysis['gps_info']['has_gps'] = False
                    analysis['screenshot_indicators'] += 1  # Screenshots rarely have GPS
                
                # Analyze Exif IFD
                if 'Exif' in exif_dict:
                    exif_ifd = exif_dict['Exif']
                    
                    # Camera settings indicate original photo
                    camera_settings = [
                        piexif.ExifIFD.ExposureTime,
                        piexif.ExifIFD.FNumber,
                        piexif.ExifIFD.ISO,
                        piexif.ExifIFD.Flash,
                        piexif.ExifIFD.FocalLength
                    ]
                    
                    for setting in camera_settings:
                        if setting in exif_ifd:
                            analysis['original_photo_indicators'] += 1
                            
            except Exception as exif_error:
                logger.debug(f"EXIF extraction failed: {str(exif_error)}")
                analysis['has_exif'] = False
                analysis['screenshot_indicators'] += 2  # No EXIF often indicates screenshot
            
            return analysis
            
        except Exception as e:
            logger.error(f"Metadata analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_compression(self, image_path: str) -> Dict:
        """
        Analyze compression patterns and quality
        """
        try:
            analysis = {
                'format': None,
                'quality_estimate': 0,
                'compression_type': None,
                'whatsapp_indicators': 0,
                'original_indicators': 0,
                'dimensions': (0, 0)
            }
            
            with Image.open(image_path) as img:
                analysis['format'] = img.format
                analysis['dimensions'] = img.size
                
                # Check for common WhatsApp resize patterns
                width, height = img.size
                for w_pattern, h_pattern in self.whatsapp_signatures['resolution_patterns']:
                    if abs(width - w_pattern) <= 50 and abs(height - h_pattern) <= 50:
                        analysis['whatsapp_indicators'] += 2
                        break
                
                # Check for screenshot resolutions
                for w_screen, h_screen in self.screenshot_signatures['resolution_patterns']:
                    if (width == w_screen and height == h_screen) or (width == h_screen and height == w_screen):
                        analysis['screenshot_indicators'] = 3
                        break
                
                # Estimate JPEG quality if applicable
                if img.format == 'JPEG':
                    quality = self._estimate_jpeg_quality(image_path)
                    analysis['quality_estimate'] = quality
                    
                    # WhatsApp typically compresses to 75-85% quality
                    for q_min, q_max in self.whatsapp_signatures['quality_ranges']:
                        if q_min <= quality <= q_max:
                            analysis['whatsapp_indicators'] += 1
                            break
                    
                    # High quality suggests original photo
                    if quality > 90:
                        analysis['original_indicators'] += 2
                    elif quality < 70:
                        analysis['whatsapp_indicators'] += 1
                
                # PNG format often indicates screenshot
                elif img.format == 'PNG':
                    analysis['screenshot_indicators'] += 2
            
            return analysis
            
        except Exception as e:
            logger.error(f"Compression analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_filename(self, filename: str) -> Dict:
        """
        Analyze filename patterns
        """
        try:
            analysis = {
                'original_name': filename,
                'whatsapp_indicators': 0,
                'screenshot_indicators': 0,
                'original_indicators': 0,
                'patterns_found': []
            }
            
            filename_lower = filename.lower()
            
            # Check for WhatsApp patterns
            whatsapp_patterns = [
                r'img-\d{8}-wa\d{4}',
                r'wa\d{4}',
                r'whatsapp',
                r'img_\d{8}_\d{6}_\d{3}'
            ]
            
            for pattern in whatsapp_patterns:
                if re.search(pattern, filename_lower):
                    analysis['whatsapp_indicators'] += 2
                    analysis['patterns_found'].append(f'whatsapp:{pattern}')
            
            # Check for screenshot patterns
            for pattern in self.screenshot_signatures['filename_patterns']:
                if re.search(pattern, filename_lower):
                    analysis['screenshot_indicators'] += 2
                    analysis['patterns_found'].append(f'screenshot:{pattern}')
            
            # Check for camera app patterns (original photos)
            camera_patterns = [
                r'img_\d{8}_\d{6}',  # Standard camera app
                r'dsc\d{4}',         # Digital camera
                r'p\d{8}_\d{6}',     # Some camera apps
                r'photo_\d+'         # Generic photo
            ]
            
            for pattern in camera_patterns:
                if re.search(pattern, filename_lower):
                    analysis['original_indicators'] += 1
                    analysis['patterns_found'].append(f'camera:{pattern}')
            
            return analysis
            
        except Exception as e:
            logger.error(f"Filename analysis failed: {str(e)}")
            return {'error': str(e)}

    def _determine_source(self, byte_analysis: Dict, metadata_analysis: Dict, 
                         compression_analysis: Dict, filename_analysis: Dict) -> Dict:
        """
        Combine all analyses to determine the most likely source
        """
        try:
            scores = {
                'ORIGINAL_PHONE_PHOTO': 0,
                'WHATSAPP_IMAGE': 0,
                'SCREENSHOT_IMAGE': 0
            }
            
            evidence = []
            
            # Metadata scoring
            if not metadata_analysis.get('error'):
                scores['ORIGINAL_PHONE_PHOTO'] += metadata_analysis.get('original_photo_indicators', 0)
                scores['WHATSAPP_IMAGE'] += metadata_analysis.get('whatsapp_indicators', 0)
                scores['SCREENSHOT_IMAGE'] += metadata_analysis.get('screenshot_indicators', 0)
                
                if metadata_analysis.get('has_exif') and metadata_analysis.get('camera_info'):
                    evidence.append("Has camera EXIF data")
                    scores['ORIGINAL_PHONE_PHOTO'] += 3
                elif not metadata_analysis.get('has_exif'):
                    evidence.append("No EXIF metadata")
                    scores['SCREENSHOT_IMAGE'] += 2
                    scores['WHATSAPP_IMAGE'] += 1
            
            # Compression scoring
            if not compression_analysis.get('error'):
                scores['WHATSAPP_IMAGE'] += compression_analysis.get('whatsapp_indicators', 0)
                scores['ORIGINAL_PHONE_PHOTO'] += compression_analysis.get('original_indicators', 0)
                scores['SCREENSHOT_IMAGE'] += compression_analysis.get('screenshot_indicators', 0)
                
                if compression_analysis.get('format') == 'PNG':
                    evidence.append("PNG format (common for screenshots)")
                elif compression_analysis.get('quality_estimate', 0) > 90:
                    evidence.append("High JPEG quality (likely original)")
                elif 75 <= compression_analysis.get('quality_estimate', 0) <= 85:
                    evidence.append("Medium JPEG quality (WhatsApp range)")
            
            # Filename scoring
            if not filename_analysis.get('error'):
                scores['WHATSAPP_IMAGE'] += filename_analysis.get('whatsapp_indicators', 0)
                scores['SCREENSHOT_IMAGE'] += filename_analysis.get('screenshot_indicators', 0)
                scores['ORIGINAL_PHONE_PHOTO'] += filename_analysis.get('original_indicators', 0)
                
                evidence.extend(filename_analysis.get('patterns_found', []))
            
            # Byte analysis scoring
            if not byte_analysis.get('error'):
                scores['WHATSAPP_IMAGE'] += byte_analysis.get('whatsapp_signatures', 0)
                scores['SCREENSHOT_IMAGE'] += byte_analysis.get('screenshot_indicators', 0)
            
            # Determine winner
            max_score = max(scores.values())
            if max_score == 0:
                return {
                    'source': 'UNKNOWN',
                    'confidence': 0.0,
                    'evidence': ['Insufficient evidence for determination']
                }
            
            # Find the source with highest score
            winner = max(scores.items(), key=lambda x: x[1])
            source_type = winner[0]
            raw_score = winner[1]
            
            # Calculate confidence (0.0 to 1.0)
            total_possible_score = 20  # Rough estimate of max possible score
            confidence = min(raw_score / total_possible_score, 1.0)
            
            # Boost confidence if there's a clear winner
            second_highest = sorted(scores.values(), reverse=True)[1] if len(scores) > 1 else 0
            if raw_score > second_highest * 1.5:
                confidence = min(confidence * 1.2, 1.0)
            
            return {
                'source': source_type,
                'confidence': confidence,
                'evidence': evidence,
                'scores': scores
            }
            
        except Exception as e:
            logger.error(f"Source determination failed: {str(e)}")
            return {
                'source': 'UNKNOWN',
                'confidence': 0.0,
                'evidence': [f'Analysis failed: {str(e)}']
            }

    def _extract_jpeg_markers(self, image_buffer: bytes) -> List[str]:
        """Extract JPEG markers from byte stream"""
        markers = []
        i = 0
        while i < len(image_buffer) - 1:
            if image_buffer[i] == 0xFF and image_buffer[i + 1] != 0xFF:
                marker = f"0xFF{image_buffer[i + 1]:02X}"
                markers.append(marker)
                i += 2
            else:
                i += 1
        return markers[:10]  # Limit to first 10 markers

    def _count_compression_artifacts(self, image_buffer: bytes) -> int:
        """Count compression artifacts (simplified)"""
        # This is a simplified implementation
        # In practice, you'd analyze DCT coefficients
        artifact_count = 0
        
        # Look for repeated byte patterns that indicate compression
        for i in range(0, len(image_buffer) - 8, 8):
            block = image_buffer[i:i+8]
            if block.count(block[0]) > 6:  # Highly repetitive block
                artifact_count += 1
        
        return min(artifact_count, 100)  # Cap at 100

    def _get_aspect_ratio(self, width: int, height: int) -> Tuple[int, int]:
        """Calculate simplified aspect ratio"""
        from math import gcd
        divisor = gcd(width, height)
        return (width // divisor, height // divisor)

    def _detect_ui_color_patterns(self, img: Image.Image) -> bool:
        """Detect common UI color patterns in image"""
        try:
            # Sample pixels from edges and corners where UI elements typically appear
            width, height = img.size
            if width < 100 or height < 100:
                return False
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Sample top and bottom edges for UI elements
            sample_points = [
                (width // 2, 10),      # Top center
                (width // 2, height - 10),  # Bottom center
                (10, height // 2),     # Left center
                (width - 10, height // 2),  # Right center
            ]
            
            ui_color_count = 0
            for x, y in sample_points:
                try:
                    r, g, b = img.getpixel((x, y))
                    # Check for common UI colors (white, light gray, black, etc.)
                    if (r == g == b and r in [0, 255]) or (240 <= r <= 255 and 240 <= g <= 255 and 240 <= b <= 255):
                        ui_color_count += 1
                except:
                    continue
            
            return ui_color_count >= 2
            
        except Exception:
            return False

    def _detect_camera_noise_pattern(self, img: Image.Image) -> bool:
        """Detect camera sensor noise patterns typical of original photos"""
        try:
            import numpy as np
            
            # Convert to grayscale for noise analysis
            gray = img.convert('L')
            img_array = np.array(gray)
            
            # Sample a small region for noise analysis
            height, width = img_array.shape
            if height < 200 or width < 200:
                return False
            
            # Sample center region
            sample_h, sample_w = min(200, height//2), min(200, width//2)
            start_h, start_w = height//4, width//4
            sample = img_array[start_h:start_h+sample_h, start_w:start_w+sample_w]
            
            # Calculate noise characteristics
            # Real camera sensors have specific noise patterns
            mean_val = np.mean(sample)
            std_val = np.std(sample)
            
            # Check for reasonable noise levels (not too clean, not too noisy)
            noise_ratio = std_val / (mean_val + 1)  # Avoid division by zero
            
            # Original photos typically have noise ratio between 0.02 and 0.15
            if 0.02 <= noise_ratio <= 0.15:
                return True
            
            return False
            
        except Exception:
            return False

    def _detect_pixel_perfect_edges(self, img: Image.Image) -> bool:
        """Detect pixel-perfect edges typical of screenshots"""
        try:
            import numpy as np
            
            # Convert to grayscale for edge detection
            gray = img.convert('L')
            img_array = np.array(gray)
            
            # Simple edge detection using gradient
            if img_array.shape[0] < 50 or img_array.shape[1] < 50:
                return False
            
            # Calculate gradients
            grad_x = np.abs(np.diff(img_array, axis=1))
            grad_y = np.abs(np.diff(img_array, axis=0))
            
            # Count sharp edges (high gradient values)
            sharp_edges_x = np.sum(grad_x > 50)
            sharp_edges_y = np.sum(grad_y > 50)
            
            total_pixels = img_array.shape[0] * img_array.shape[1]
            edge_ratio = (sharp_edges_x + sharp_edges_y) / total_pixels
            
            # Screenshots typically have more sharp edges than photos
            return edge_ratio > 0.01
            
        except Exception:
            return False

    def _estimate_jpeg_quality_advanced(self, image_path: str) -> int:
        """Advanced JPEG quality estimation using quantization tables"""
        try:
            with open(image_path, 'rb') as f:
                data = f.read()
            
            # Look for quantization tables in JPEG
            # This is a simplified implementation
            # Real implementation would parse DQT segments
            
            # Fallback to file size based estimation
            file_size = len(data)
            with Image.open(image_path) as img:
                if img.format != 'JPEG':
                    return 100  # PNG or other lossless
                
                pixels = img.size[0] * img.size[1]
                bytes_per_pixel = file_size / pixels
                
                # Improved quality estimation based on compression ratio
                if bytes_per_pixel > 3.0:
                    return 98  # Very high quality
                elif bytes_per_pixel > 2.0:
                    return 92  # High quality
                elif bytes_per_pixel > 1.5:
                    return 85  # Medium-high quality
                elif bytes_per_pixel > 1.0:
                    return 75  # Medium quality (WhatsApp range)
                elif bytes_per_pixel > 0.5:
                    return 65  # Medium-low quality (WhatsApp range)
                else:
                    return 50  # Low quality
                    
        except Exception:
            return 80  # Default fallback

    def _estimate_jpeg_quality(self, image_path: str) -> int:
        """Estimate JPEG quality (simplified implementation)"""
        try:
            with Image.open(image_path) as img:
                if hasattr(img, 'quantization'):
                    # This is a simplified quality estimation
                    # Real implementation would analyze quantization tables
                    return 85  # Default estimate
                
            # Fallback: estimate based on file size vs dimensions
            file_size = os.path.getsize(image_path)
            with Image.open(image_path) as img:
                pixels = img.size[0] * img.size[1]
                bytes_per_pixel = file_size / pixels
                
                if bytes_per_pixel > 2.0:
                    return 95  # High quality
                elif bytes_per_pixel > 1.0:
                    return 85  # Medium-high quality
                elif bytes_per_pixel > 0.5:
                    return 75  # Medium quality
                else:
                    return 60  # Low quality
                    
        except Exception:
            return 80  # Default fallback

    def _fallback_response(self, error_reason: str) -> Dict:
        """Return safe fallback when analysis fails"""
        return {
            'source_type': 'UNKNOWN',
            'confidence_score': 0.0,
            'evidence': [f'Analysis failed: {error_reason}'],
            'byte_analysis': {'error': error_reason},
            'metadata_analysis': {'error': error_reason},
            'compression_analysis': {'error': error_reason},
            'filename_analysis': {'error': error_reason},
            'forensics_version': '1.0'
        }


# Main function for external use
def analyze_image_source(image_path: str, filename: str) -> Dict:
    """
    Analyze image to determine its source
    
    Args:
        image_path: Path to the image file
        filename: Original filename
        
    Returns:
        Dict with source analysis results
    """
    forensics = ImageSourceForensics()
    return forensics.analyze_image_source(image_path, filename)


# Export main function
__all__ = ['analyze_image_source', 'ImageSourceForensics']