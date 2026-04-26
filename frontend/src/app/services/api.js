import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  //baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  // baseURL: 'http://localhost:8080/api', // local testing
  baseURL: import.meta.env.VITE_API_URL, // deployment
  //timeout: 10000,
  timeout: 50000, // increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions for incidents
export const incidentService = {
  // Get all incidents
  getAllIncidents: async (params = {}) => {
    try {
      const response = await api.get('/incidents', { params });
      //return response.data;
      return response.data.content;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },

  // Get incident by ID
  getIncidentById: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching incident ${id}:`, error);
      throw error;
    }
  },

  // Get incident resolution by Incident ID
  getIncidentResolution: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}/resolution`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resolution ${id}:`, error);
      throw error;
    }
  },

  // Get latest AI analysis by Incident ID
  getIncidentAnalysis: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}/analysis`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching AI analysis ${id}:`, error);
      throw error;
    }
  },

  // Get RCA by Incident ID
  getIncidentRCA: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}/rca`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching RCA Document ${id}:`, error);
      throw error;
    }
  },

  // Trigger AI analysis
  analyzeIncident: async (id) => {
    try {
      const response = await api.post(`/incidents/${id}/analyze`);
      return response.data;
    } catch (error) {
      console.error(`Error analyzing incident ${id}:`, error);
      throw error;
    }
  },

  // Submit incident resolution
  resolveIncident: async (id, payload) => {
    try {
      const response = await api.post(`/incidents/${id}/resolution`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error resolving incident ${id}:`, error);
      throw error;
    }
  },

  // Trigger Generate RCA
  generateRCA: async (id) => {
    try {
      const response = await api.post(`/incidents/${id}/generate-rca`);
      return response.data;
    } catch (error) {
      console.error(`Error generating RCA ${id}:`, error);
      throw error;
    }
  },

  // Trigger update RCA
  updateRCA: async (id, payload) => {
    try {
      const response = await api.put(`/incidents/rca/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating RCA ${id}:`, error);
      throw error;
    }
  },
};

export default api;
