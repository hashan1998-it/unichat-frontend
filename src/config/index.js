const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
    isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
    isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  };
  
  export default config;