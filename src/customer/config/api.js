// Function to detect local IP and return appropriate base URL
const getBaseUrl = () => {
  return "https://api.omninovawai.com";
};

// API Configuration for Customer Panel
export const API_CONFIG = {
  // Base URL for your API - automatically detected based on local IP
  BASE_URL: getBaseUrl(),

  // Customer API Endpoints
  ENDPOINTS: {
    COMPANY_DETAILS: "/api/customer/company-details",
    BLOGS: "/api/customer/blogs",
    BLOG_DETAILS: "/api/customer/blogs",
    PROJECTS: "/api/customer/projects",
    PROJECT_DETAILS: "/api/customer/projects",
    PROJECT_TYPES: "/api/customer/project-types",
  },

  // Request timeout in milliseconds
  TIMEOUT: 60000,

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
