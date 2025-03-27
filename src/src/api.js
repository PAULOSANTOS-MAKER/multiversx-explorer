import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.multiversx.com',
});

export default api;
