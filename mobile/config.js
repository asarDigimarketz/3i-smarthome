// API Configuration
export const API_CONFIG = {
  // Development - Use your local IP address when testing on physical device
  // For iOS Simulator/Android Emulator, use localhost
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.32:5000',
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'a05f3614632a268ef4766209e8fb5bfef639572f819c559a79237626fef1d9d6',
  
  // If running on physical device, uncomment and update with your computer's IP
  // API_URL: 'http://192.168.1.100:3000',
}

// Usage in components:
// import { API_CONFIG } from '../../../config'
// const response = await axios.get(`${API_CONFIG.API_URL}/api/settings/emailConfiguration`)