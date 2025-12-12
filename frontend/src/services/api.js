// API service for GrievanceGenie frontend

const API_BASE_URL = 'http://127.0.0.1:5000'; // Python FastAPI server

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