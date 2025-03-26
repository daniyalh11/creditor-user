// src/utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000", // Match your backend port
  withCredentials: true, // Send cookies with requests
});

export default api;