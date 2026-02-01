import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: user-id 헤더 추가
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['user-id'] = userId;
  }
  return config;
});

// 인증 API
export const authAPI = {
  signup: async (email: string, password: string, nickname: string) => {
    const response = await api.post('/api/auth/signup', { email, password, nickname });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// 커플 API
export const coupleAPI = {
  createCode: async () => {
    const response = await api.post('/api/couple/create');
    return response.data;
  },

  joinCouple: async (code: string) => {
    const response = await api.post('/api/couple/join', { code });
    return response.data;
  },

  getCouple: async () => {
    const response = await api.get('/api/couple');
    return response.data;
  },
};

// 추천 API
export const recommendAPI = {
  getRecommendation: async (coupleId: string) => {
    const response = await api.get(`/api/recommend/${coupleId}`);
    return response.data;
  },

  getDaily: async () => {
    const response = await api.get('/api/recommend/daily');
    return response.data;
  },
};

// 채팅 API
export const chatAPI = {
  getMessages: async (coupleId: string) => {
    const response = await api.get(`/api/chat/${coupleId}`);
    return response.data;
  },

  sendMessage: async (coupleId: string, content: string) => {
    const response = await api.post(`/api/chat/${coupleId}`, { content });
    return response.data;
  },
};

// 장소 API
export const placeAPI = {
  search: async (keyword: string, region?: string) => {
    const response = await api.get('/api/places/search', {
      params: { keyword, region },
    });
    return response.data;
  },

  getDetail: async (placeId: string) => {
    const response = await api.get(`/api/places/${placeId}`);
    return response.data;
  },
};

export default api;
