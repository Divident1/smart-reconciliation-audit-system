import axios from 'axios';

const API = axios.create({
    baseURL: 'https://smartreco-backend.onrender.com'
});

export default API;
