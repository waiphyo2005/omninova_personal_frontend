// Function to detect local IP and return appropriate base URL
const getBaseUrl = () => {
  return "https://api.omninovawai.com";
};

// API Configuration
export const API_CONFIG = {
  // Base URL for your API - automatically detected based on local IP
  BASE_URL: getBaseUrl(),

  // API Endpoints
  ENDPOINTS: {
    LOGIN: "/api/admin/login",
    LOGOUT: "/api/admin/logout",
    REFRESH: "/api/admin/refresh",
    REGISTER: "/api/admin/register",
    USER_PROFILE: "/api/user/profile",
    ADMIN_PROFILE: "/api/admin/profile",
    COMPANY: "/api/admin/company",
    COMPANY_LOGO: "/api/admin/company/logo",
    COMPANY_SOCIAL_MEDIA: "/api/admin/company/social-media",
    COMPANY_CONTACTS: "/api/admin/company/contacts",
    USERS: "/api/admin/users",
    BLOGS: "/api/admin/blogs",
    BLOG_IMAGES: "/api/admin/blogs",
    BLOG_IMAGE_DELETE: "/api/admin/blog-images",
    EDIT_PROFILE: "/api/admin/edit-profile",
    CHANGE_PASSWORD: "/api/admin/change-password",
    PROJECT_TYPES: "/api/admin/project-types",
    PROJECTS: "/api/admin/projects",
    // Add more endpoints as needed
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
