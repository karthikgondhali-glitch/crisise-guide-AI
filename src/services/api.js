import axios from 'axios';

const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchScenarios = async () => {
  const response = await apiClient.get('/scenarios');
  return response.data;
};

export const runSimulation = async (payload) => {
  const response = await apiClient.post('/simulate', payload);
  return response.data;
};

export const triggerEmergency = async (additionalDemand = 15) => {
  const response = await apiClient.post('/emergency', {
    additional_demand: additionalDemand,
  });
  return response.data;
};

export const compareStrategies = async (payload = {}) => {
  const response = await apiClient.post('/compare-strategies', payload);
  return response.data;
};

export const fetchBackendSource = async () => {
  const response = await apiClient.get('/api/backend-source');
  return response.data;
};

export default apiClient;
