// API service for GrievanceGenie frontend

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5000'; // Python FastAPI server

// Debug logging
console.log('Environment variables:', {
  REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  API_BASE_URL: API_BASE_URL
});

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    console.log('Making API request to:', url); // Debug logging
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Issue Management
  async getIssues(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.verification && filters.verification !== 'all') {
      params.append('verification', filters.verification);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/issues?${queryString}` : '/issues';
    
    return this.request(endpoint);
  }

  async getIssue(issueId) {
    return this.request(`/issues/${issueId}`);
  }

  async createIssue(issueData) {
    return this.request('/report', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssueStatus(issueId, status) {
    return this.request(`/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async uploadPhotos(issueId, photos) {
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });

    return this.request(`/issues/${issueId}/photos`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // Complaint Creation (Phase 1 - with officer auto-assignment)
  async createComplaint(complaintData) {
    const formData = new FormData();
    
    // Add all form fields
    formData.append('citizen_name', complaintData.citizenName);
    if (complaintData.citizenPhone) {
      formData.append('citizen_phone', complaintData.citizenPhone);
    }
    formData.append('category', complaintData.category);
    formData.append('severity', complaintData.severity);
    formData.append('description', complaintData.description);
    formData.append('ward', complaintData.ward);
    formData.append('location', complaintData.location);
    formData.append('latitude', complaintData.latitude);
    formData.append('longitude', complaintData.longitude);
    
    // Add image file
    if (complaintData.image) {
      formData.append('image', complaintData.image);
    }
    
    // Add validation record ID if available
    if (complaintData.validation_record_id) {
      formData.append('validation_record_id', complaintData.validation_record_id);
    }

    return this.request('/complaints/create', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // AI Analysis (legacy)
  async analyzeDescription(description) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  // Conversational AI
  async sendChatMessage(message, conversationId = null, history = null) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        conversationId, 
        history 
      }),
    });
  }

  // Verification Management
  async createVerification(verificationData) {
    return this.request('/verifications', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async getIssueVerifications(issueId) {
    return this.request(`/issues/${issueId}/verifications`);
  }

  // Statistics
  async getStats() {
    return this.request('/stats');
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;