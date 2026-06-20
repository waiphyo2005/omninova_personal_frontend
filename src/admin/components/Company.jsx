import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  logoutUser,
  fetchCompanyData,
  apiRequest,
  uploadCompanyLogo,
  updateCompanyData,
} from "../utils/auth";
import { buildApiUrl, API_CONFIG } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Company.css";

const renderMarkdown = (markdown) => {
  if (!markdown) return "Not provided";

  // Split by paragraphs
  const paragraphs = markdown.split("\n\n").filter((p) => p.trim());

  return (
    <div className="markdown-content">
      {paragraphs.map((paragraph, index) => {
        // Process the paragraph for formatting
        const parts = [];
        let keyIndex = 0;

        // Process bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        let lastIndex = 0;

        while ((match = boldRegex.exec(paragraph)) !== null) {
          // Add text before bold
          if (match.index > lastIndex) {
            parts.push(paragraph.slice(lastIndex, match.index));
          }
          // Add bold text
          parts.push(<strong key={`bold-${keyIndex++}`}>{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < paragraph.length) {
          parts.push(paragraph.slice(lastIndex));
        }

        // If no formatting was found, process italic
        if (parts.length === 0) {
          const italicRegex = /\*(.*?)\*/g;
          let italicMatch;
          lastIndex = 0;

          while ((italicMatch = italicRegex.exec(paragraph)) !== null) {
            if (italicMatch.index > lastIndex) {
              parts.push(paragraph.slice(lastIndex, italicMatch.index));
            }
            parts.push(<em key={`italic-${keyIndex++}`}>{italicMatch[1]}</em>);
            lastIndex = italicRegex.lastIndex;
          }

          if (lastIndex < paragraph.length) {
            parts.push(paragraph.slice(lastIndex));
          }

          // If still no formatting, just clean the text
          if (parts.length === 0) {
            const cleanText = paragraph
              .replace(/^\s*[-*+]\s+/gm, "• ")
              .replace(/^\s*\d+\.\s+/gm, "");
            parts.push(cleanText);
          }
        }

        return (
          <p key={index} className="markdown-paragraph">
            {parts}
          </p>
        );
      })}
    </div>
  );
};

const Company = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(() => {
    try {
      const cached = localStorage.getItem("company_data_cache");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem("company_data_cache");
    } catch {
      return true;
    }
  });
  const [error, setError] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");
  const [logoVersion, setLogoVersion] = useState(Date.now());
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    vision: "",
    goal: "",
    founded_date: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialFormData, setSocialFormData] = useState({
    platform_name: "",
    page_url: "",
  });
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialErrors, setSocialErrors] = useState({});
  const [showDeleteSocialModal, setShowDeleteSocialModal] = useState(false);
  const [socialToDelete, setSocialToDelete] = useState(null);
  const [deleteSocialLoading, setDeleteSocialLoading] = useState(false);
  const [showEditSocialModal, setShowEditSocialModal] = useState(false);
  const [socialToEdit, setSocialToEdit] = useState(null);
  const [editSocialFormData, setEditSocialFormData] = useState({
    platform_name: "",
    page_url: "",
  });
  const [editSocialLoading, setEditSocialLoading] = useState(false);
  const [editSocialErrors, setEditSocialErrors] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    department: "",
    phone_number: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactErrors, setContactErrors] = useState({});
  const [showDeleteContactModal, setShowDeleteContactModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteContactLoading, setDeleteContactLoading] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [editContactFormData, setEditContactFormData] = useState({
    department: "",
    phone_number: "",
  });
  const [editContactLoading, setEditContactLoading] = useState(false);
  const [editContactErrors, setEditContactErrors] = useState({});

  const loadCompanyData = async () => {
    try {
      setLoading(company ? false : true);
      setError("");
      const response = await fetchCompanyData();

      console.log("Company API Response:", response);

      const companyData = response.data || response;
      setCompany(companyData);
      setLogoLoadError(false);
      localStorage.setItem("company_data_cache", JSON.stringify(companyData));
    } catch (error) {
      setError(error.message || "Failed to load company data");
      console.error("Failed to fetch company data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCurrentUserProfile = async () => {
      try {
        const response = await apiRequest(
          buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PROFILE)
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentUserProfile(data.data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn(
            "Failed to fetch profile:",
            errorData.message || response.status
          );
        }
      } catch (error) {
        console.warn("Profile fetch error:", error.message);
      }
    };

    const userData = getUser();
    if (userData) {
      getCurrentUserProfile();
    }

    loadCompanyData();

    // No longer need localStorage success message handling
    // Logo cache will handle updates automatically
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/admin/login");
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    setLogoError("");
    setLogoSuccess("");

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validate file type - only allow JPEG, PNG, JPG, GIF, SVG (Laravel rule: image|mimes:jpeg,png,jpg,gif,svg|max:2048)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    if (!allowedTypes.includes(fileType) || !allowedExtensions.includes(fileExtension)) {
      setLogoError("Unacceptable image format. Only JPEG, PNG, JPG, GIF, and SVG files are allowed.");
      e.target.value = "";
      return;
    }

    // Validate file size - 2MB limit (2048KB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image file size should be less than 2MB.");
      e.target.value = "";
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setLogoError("Please select an image file.");
      return;
    }

    setLogoUploading(true);
    setLogoError("");
    setLogoSuccess("");

    try {
      const data = await uploadCompanyLogo(logoFile);

      // Close modal immediately
      closeLogoModal();

      // Update logo version to force refresh across all components
      const newVersion = Date.now();
      setLogoVersion(newVersion);
      setLogoLoadError(false);

      // Dispatch event to update other components
      window.dispatchEvent(
        new CustomEvent("logoUpdated", {
          detail: { version: newVersion },
        })
      );

      // Show success message
      setLogoSuccess("Company logo has been successfully updated!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setLogoSuccess("");
      }, 5000);

      // Refresh company data to get updated logo_url
      await loadCompanyData();
    } catch (error) {
      console.error("Logo upload failed:", error);

      // Handle validation errors specifically
      if (error.validationErrors) {
        const errorMessages = Object.values(error.validationErrors).flat();
        setLogoError(
          errorMessages.join(". ") ||
            "Validation failed. Please check your file and try again."
        );
      } else {
        setLogoError(
          error.message || "Failed to upload logo. Please try again."
        );
      }
    } finally {
      setLogoUploading(false);
    }
  };

  const openLogoModal = () => {
    setShowLogoModal(true);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");
    setLogoSuccess("");
    setSuccessMessage("");
  };

  const closeLogoModal = () => {
    setShowLogoModal(false);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");
    setLogoSuccess("");
  };

  const openEditModal = () => {
    // Pre-populate form with existing data
    setEditFormData({
      name: company.name || "",
      description: company.description || "",
      vision: company.vision || "",
      goal: company.goal || "",
      founded_date: company.founded_date || "",
      address: company.address || "",
    });
    setShowEditModal(true);
    setEditError("");
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      name: "",
      description: "",
      vision: "",
      goal: "",
      founded_date: "",
      address: "",
    });
    setEditError("");
  };

  const openSocialModal = () => {
    setShowSocialModal(true);
    setSocialFormData({
      platform_name: "",
      page_url: "",
    });
    setSocialErrors({});
  };

  const closeSocialModal = () => {
    setShowSocialModal(false);
    setSocialFormData({
      platform_name: "",
      page_url: "",
    });
    setSocialErrors({});
  };

  const handleSocialInputChange = (e) => {
    const { name, value } = e.target;
    setSocialFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (socialErrors[name]) {
      setSocialErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateSocialForm = () => {
    const errors = {};

    if (!socialFormData.platform_name.trim()) {
      errors.platform_name = "Platform name is required";
    }

    if (!socialFormData.page_url.trim()) {
      errors.page_url = "Page URL is required";
    } else if (
      !socialFormData.page_url.startsWith("http://") &&
      !socialFormData.page_url.startsWith("https://")
    ) {
      errors.page_url =
        "Please enter a valid URL (must start with http:// or https://)";
    }

    return errors;
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();

    const errors = validateSocialForm();
    if (Object.keys(errors).length > 0) {
      setSocialErrors(errors);
      return;
    }

    try {
      setSocialLoading(true);
      setSocialErrors({});

      const response = await apiRequest(
        buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY_SOCIAL_MEDIA),
        {
          method: "POST",
          body: JSON.stringify(socialFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add social media");
      }

      // Show success message
      setSuccessMessage("Social media added successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      closeSocialModal();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to add social media:", error);
      setSocialErrors({
        general:
          error.message || "Failed to add social media. Please try again.",
      });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleDeleteSocialClick = (social) => {
    setSocialToDelete(social);
    setShowDeleteSocialModal(true);
  };

  const handleDeleteSocialCancel = () => {
    setShowDeleteSocialModal(false);
    setSocialToDelete(null);
  };

  const handleDeleteSocialConfirm = async () => {
    if (!socialToDelete) return;

    try {
      setDeleteSocialLoading(true);

      const response = await apiRequest(
        buildApiUrl(
          `${API_CONFIG.ENDPOINTS.COMPANY_SOCIAL_MEDIA}/${socialToDelete.id}`
        ),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete social media");
      }

      // Show success message
      setSuccessMessage(
        `${socialToDelete.platform_name} social media deleted successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      handleDeleteSocialCancel();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to delete social media:", error);
      setSuccessMessage(
        error.message || "Failed to delete social media. Please try again."
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } finally {
      setDeleteSocialLoading(false);
    }
  };

  const handleEditSocialClick = (social) => {
    setSocialToEdit(social);
    setEditSocialFormData({
      platform_name: social.platform_name,
      page_url: social.page_url,
    });
    setShowEditSocialModal(true);
    setEditSocialErrors({});
  };

  const handleEditSocialCancel = () => {
    setShowEditSocialModal(false);
    setSocialToEdit(null);
    setEditSocialFormData({
      platform_name: "",
      page_url: "",
    });
    setEditSocialErrors({});
  };

  const handleEditSocialInputChange = (e) => {
    const { name, value } = e.target;
    setEditSocialFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (editSocialErrors[name]) {
      setEditSocialErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditSocialForm = () => {
    const errors = {};

    if (!editSocialFormData.platform_name.trim()) {
      errors.platform_name = "Platform name is required";
    }

    if (!editSocialFormData.page_url.trim()) {
      errors.page_url = "Page URL is required";
    } else if (
      !editSocialFormData.page_url.startsWith("http://") &&
      !editSocialFormData.page_url.startsWith("https://")
    ) {
      errors.page_url =
        "Please enter a valid URL (must start with http:// or https://)";
    }

    return errors;
  };

  const handleEditSocialSubmit = async (e) => {
    e.preventDefault();

    if (!socialToEdit) return;

    const errors = validateEditSocialForm();
    if (Object.keys(errors).length > 0) {
      setEditSocialErrors(errors);
      return;
    }

    try {
      setEditSocialLoading(true);
      setEditSocialErrors({});

      const response = await apiRequest(
        buildApiUrl(
          `${API_CONFIG.ENDPOINTS.COMPANY_SOCIAL_MEDIA}/${socialToEdit.id}`
        ),
        {
          method: "PUT",
          body: JSON.stringify(editSocialFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update social media");
      }

      // Show success message
      setSuccessMessage(
        `${editSocialFormData.platform_name} social media updated successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      handleEditSocialCancel();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to update social media:", error);
      setEditSocialErrors({
        general:
          error.message || "Failed to update social media. Please try again.",
      });
    } finally {
      setEditSocialLoading(false);
    }
  };

  const openContactModal = () => {
    setShowContactModal(true);
    setContactFormData({
      department: "",
      phone_number: "",
    });
    setContactErrors({});
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactFormData({
      department: "",
      phone_number: "",
    });
    setContactErrors({});
  };

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (contactErrors[name]) {
      setContactErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateContactForm = () => {
    const errors = {};

    if (!contactFormData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!contactFormData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (
      !/^[\+]?[1-9][\d\-\(\)\s\.]{7,20}$/.test(
        contactFormData.phone_number.trim()
      )
    ) {
      errors.phone_number =
        "Please enter a valid phone number (e.g., +1 (202) 555-0488)";
    }

    return errors;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const errors = validateContactForm();
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    try {
      setContactLoading(true);
      setContactErrors({});

      const response = await apiRequest(
        buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY_CONTACTS),
        {
          method: "POST",
          body: JSON.stringify(contactFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add contact");
      }

      // Show success message
      setSuccessMessage("Contact added successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      closeContactModal();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to add contact:", error);
      setContactErrors({
        general: error.message || "Failed to add contact. Please try again.",
      });
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContactClick = (contact) => {
    setContactToDelete(contact);
    setShowDeleteContactModal(true);
  };

  const handleDeleteContactCancel = () => {
    setShowDeleteContactModal(false);
    setContactToDelete(null);
  };

  const handleDeleteContactConfirm = async () => {
    if (!contactToDelete) return;

    try {
      setDeleteContactLoading(true);

      const response = await apiRequest(
        buildApiUrl(
          `${API_CONFIG.ENDPOINTS.COMPANY_CONTACTS}/${contactToDelete.id}`
        ),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete contact");
      }

      // Show success message
      setSuccessMessage(
        `${contactToDelete.department} contact deleted successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      handleDeleteContactCancel();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      setSuccessMessage(
        error.message || "Failed to delete contact. Please try again."
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } finally {
      setDeleteContactLoading(false);
    }
  };

  const handleEditContactClick = (contact) => {
    setContactToEdit(contact);
    setEditContactFormData({
      department: contact.department,
      phone_number: contact.phone_number,
    });
    setShowEditContactModal(true);
    setEditContactErrors({});
  };

  const handleEditContactCancel = () => {
    setShowEditContactModal(false);
    setContactToEdit(null);
    setEditContactFormData({
      department: "",
      phone_number: "",
    });
    setEditContactErrors({});
  };

  const handleEditContactInputChange = (e) => {
    const { name, value } = e.target;
    setEditContactFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (editContactErrors[name]) {
      setEditContactErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditContactForm = () => {
    const errors = {};

    if (!editContactFormData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!editContactFormData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (
      !/^[\+]?[1-9][\d\-\(\)\s\.]{7,20}$/.test(
        editContactFormData.phone_number.trim()
      )
    ) {
      errors.phone_number =
        "Please enter a valid phone number (e.g., +1 (202) 555-0488)";
    }

    return errors;
  };

  const handleEditContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactToEdit) return;

    const errors = validateEditContactForm();
    if (Object.keys(errors).length > 0) {
      setEditContactErrors(errors);
      return;
    }

    try {
      setEditContactLoading(true);
      setEditContactErrors({});

      const response = await apiRequest(
        buildApiUrl(
          `${API_CONFIG.ENDPOINTS.COMPANY_CONTACTS}/${contactToEdit.id}`
        ),
        {
          method: "PUT",
          body: JSON.stringify(editContactFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update contact");
      }

      // Show success message
      setSuccessMessage(
        `${editContactFormData.department} contact updated successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Close modal and refresh company data
      handleEditContactCancel();
      loadCompanyData();
    } catch (error) {
      console.error("Failed to update contact:", error);
      setEditContactErrors({
        general: error.message || "Failed to update contact. Please try again.",
      });
    } finally {
      setEditContactLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields are filled
    const requiredFields = [
      "name",
      "description",
      "vision",
      "goal",
      "founded_date",
      "address",
    ];
    for (const field of requiredFields) {
      if (!editFormData[field].trim()) {
        setEditError(`Please fill in the ${field.replace("_", " ")} field.`);
        return;
      }
    }

    setEditLoading(true);
    setEditError("");

    try {
      const data = await updateCompanyData(editFormData);

      // Close modal
      closeEditModal();

      // Show success message
      setSuccessMessage(
        data.message || "Company details updated successfully!"
      );
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh company data
      await loadCompanyData();
    } catch (error) {
      console.error("Company update failed:", error);

      // Handle validation errors specifically
      if (error.validationErrors) {
        const errorMessages = Object.values(error.validationErrors)
          .flat()
          .join(", ");
        setEditError(errorMessages);
      } else {
        setEditError(error.message || "Failed to update company details");
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="company-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="company-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <h2>Loading Company Details...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="company-content">
          <div className="error-state">
            <h2>[ERROR] Error Loading Company Data</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="company-container">
      <Navbar
        onLogout={handleLogout}
        userName={currentUserProfile?.name || "Admin"}
      />

      <main className="company-content">
        <div className="company-header">
          <div className="header-info">
            <h1>Company Details</h1>
            <p>Comprehensive information about our organization</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span className="success-text">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="success-close-btn"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {company && (
          <div className="company-display">
            {/* Section 1: Company Details */}
            <div className="company-card">
              <div className="card-header">
                <h2>Company Details</h2>
                <button
                  onClick={openEditModal}
                  className="company-edit-btn"
                  title="Edit Company Details"
                >
                  Edit Details
                </button>
              </div>
              <div className="card-content">
                <div className="company-overview">
                  <div className="logo-container-wrapper">
                    <div className="company-logo-container">
                      {company?.logo_url && !logoLoadError ? (
                        <img
                          src={`${company.logo_url}?v=${logoVersion}`}
                          alt="Company Logo"
                          className="company-logo"
                          onError={() => setLogoLoadError(true)}
                        />
                      ) : (
                        <div className="company-logo-fallback">
                          <span className="logo-text">
                            {(company?.name || "O").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={openLogoModal}
                        className="logo-overlay logo-replace-btn"
                        title="Replace Company Logo"
                      >
                        <span className="btn-icon">🔄</span>
                      </button>
                    </div>
                  </div>
                  <div className="company-info">
                    <h3 className="company-name">
                      {company.name || "Company Name"}
                    </h3>
                    {company.founded_date && (
                      <div className="company-founded">
                        <span className="label">Founded:</span>
                        <span className="value">{company.founded_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="company-texts">
                  <div className="text-item">
                    <div className="text-header">
                      <h4>Description</h4>
                    </div>
                    <div className="text-content">
                      {renderMarkdown(company.description)}
                    </div>
                  </div>

                  <div className="text-item">
                    <div className="text-header">
                      <h4>Vision</h4>
                    </div>
                    <div className="text-content">
                      {renderMarkdown(company.vision)}
                    </div>
                  </div>

                  <div className="text-item">
                    <div className="text-header">
                      <h4>Goal</h4>
                    </div>
                    <div className="text-content">
                      {renderMarkdown(company.goal)}
                    </div>
                  </div>

                  <div className="text-item">
                    <div className="text-header">
                      <h4>Address</h4>
                    </div>
                    <div className="text-content">
                      <p>{company.address || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Social Media */}
            <div className="company-card">
              <div className="card-header">
                <h2>Social Media</h2>
                <button
                  onClick={openSocialModal}
                  className="add-social-btn"
                  title="Add Social Media"
                >
                  Add Social Media
                </button>
              </div>
              <div className="card-content">
                {company.social_media && company.social_media.length > 0 ? (
                  <div className="social-media-grid">
                    {company.social_media.map((social) => (
                      <div key={social.id} className="social-media-item">
                        <div className="social-content">
                          <div className="social-platform">
                            <strong>{social.platform_name}</strong>
                          </div>
                          <a
                            href={social.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                          >
                            {social.page_url}
                          </a>
                        </div>
                        <div className="social-actions">
                          <button
                            onClick={() => handleEditSocialClick(social)}
                            className="action-btn edit-btn"
                            title={`Edit ${social.platform_name}`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSocialClick(social)}
                            className="action-btn delete-btn"
                            title={`Delete ${social.platform_name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-social-media">
                    <p>No social media accounts added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Contact Information */}
            <div className="company-card">
              <div className="card-header">
                <h2>Contact Information</h2>
                <button
                  onClick={openContactModal}
                  className="add-social-btn"
                  title="Add Contact"
                >
                  Add Contact
                </button>
              </div>
              <div className="card-content">
                {company.contacts && company.contacts.length > 0 ? (
                  <div className="contacts-grid">
                    {company.contacts.map((contact) => (
                      <div key={contact.id} className="contact-item">
                        <div className="contact-content">
                          <div className="contact-department">
                            <strong>{contact.department}</strong>
                          </div>
                          <div className="contact-phone">
                            {contact.phone_number}
                          </div>
                        </div>
                        <div className="contact-actions">
                          <button
                            onClick={() => handleEditContactClick(contact)}
                            className="action-btn edit-btn"
                            title={`Edit ${contact.department}`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteContactClick(contact)}
                            className="action-btn delete-btn"
                            title={`Delete ${contact.department}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-contacts">
                    <p>No contacts added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Last Updated */}
            {company.updated_user_name && (
              <div className="company-card">
                <div className="card-header">
                  <h2>Last Updated</h2>
                </div>
                <div className="card-content">
                  <div className="updated-info">
                    <div className="updated-item">
                      <span className="label">Updated by:</span>
                      <span className="value">{company.updated_user_name}</span>
                    </div>
                    {company.updated_at && (
                      <div className="updated-item">
                        <span className="label">Date:</span>
                        <span className="value">{company.updated_at}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Company Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div
            className="modal-content edit-modal"
            style={{
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                Edit Company Details
              </h3>
              <button
                onClick={closeEditModal}
                className="modal-close"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                      htmlFor="name"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter company name"
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                      htmlFor="founded_date"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Founded Date *
                    </label>
                    <input
                      type="date"
                      id="founded_date"
                      name="founded_date"
                      value={editFormData.founded_date}
                      onChange={handleEditInputChange}
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: "span 2",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      htmlFor="description"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter company description"
                      rows={3}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: "span 2",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      htmlFor="vision"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Vision *
                    </label>
                    <textarea
                      id="vision"
                      name="vision"
                      value={editFormData.vision}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter company vision"
                      rows={3}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: "span 2",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      htmlFor="goal"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Goals *
                    </label>
                    <textarea
                      id="goal"
                      name="goal"
                      value={editFormData.goal}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter company goals"
                      rows={3}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: "span 2",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      htmlFor="address"
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter company address"
                      rows={2}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        width: "100%",
                        boxSizing: "border-box",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>

                {editError && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px",
                      backgroundColor: "#fee",
                      border: "1px solid #fcc",
                      borderRadius: "6px",
                      color: "#c33",
                      fontSize: "14px",
                    }}
                  >
                    {editError}
                  </div>
                )}
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: "16px 24px 24px",
                  borderTop: "1px solid #eee",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-secondary"
                  disabled={editLoading}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: editLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="confirm-add-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {editLoading ? (
                    <>
                      <div className="spinner small-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logo Upload Modal */}
      {showLogoModal && (
        <div className="modal-overlay">
          <div
            className="modal-content logo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Replace Company Logo</h3>
              <button onClick={closeLogoModal} className="modal-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="file-upload-section">
                <label htmlFor="logo-upload" className="file-upload-label">
                  {logoPreview ? (
                    <div className="preview-container">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="logo-preview"
                      />
                      <p>Click to change image</p>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <p>Click to select an image</p>
                      <p className="upload-hint">
                        Supported formats: JPG, PNG, GIF, SVG
                      </p>
                    </div>
                  )}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.svg"
                  onChange={handleLogoFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {logoError && <div className="error-message">{logoError}</div>}

              {logoSuccess && (
                <div className="success-message">{logoSuccess}</div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeLogoModal} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleLogoUpload}
                disabled={!logoFile || logoUploading}
                className="btn-primary"
              >
                {logoUploading ? (
                  <>
                    <div className="spinner small-spinner"></div>
                    Uploading
                  </>
                ) : (
                  "Upload Logo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Social Media Modal */}
      {showSocialModal && (
        <div className="modal-overlay">
          <div className="modal-content add-social-modal">
            <div className="modal-header">
              <h2>Add Social Media</h2>
              <button onClick={closeSocialModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {socialErrors.general && (
                <div className="form-error general-error">
                  {socialErrors.general}
                </div>
              )}

              <form onSubmit={handleSocialSubmit} className="add-social-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="platform_name">Platform Name *</label>
                    <input
                      type="text"
                      id="platform_name"
                      name="platform_name"
                      value={socialFormData.platform_name}
                      onChange={handleSocialInputChange}
                      placeholder="e.g., LinkedIn, Twitter, Facebook"
                      className={socialErrors.platform_name ? "error" : ""}
                    />
                    {socialErrors.platform_name && (
                      <span className="form-error">
                        {socialErrors.platform_name}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="page_url">Page URL *</label>
                    <input
                      type="url"
                      id="page_url"
                      name="page_url"
                      value={socialFormData.page_url}
                      onChange={handleSocialInputChange}
                      placeholder="https://www.linkedin.com/company/omninov"
                      className={socialErrors.page_url ? "error" : ""}
                    />
                    {socialErrors.page_url && (
                      <span className="form-error">
                        {socialErrors.page_url}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={closeSocialModal}
                className="cancel-btn"
                disabled={socialLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSocialSubmit}
                className="confirm-add-btn"
                disabled={socialLoading}
              >
                {socialLoading ? "Adding..." : "Add Social Media"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Social Media Confirmation Modal */}
      {showDeleteSocialModal && socialToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                onClick={handleDeleteSocialCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>⚠️</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this social media?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{socialToDelete.platform_name}</strong>.
                  </p>
                  <p className="delete-url">{socialToDelete.page_url}</p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteSocialCancel}
                className="cancel-btn"
                disabled={deleteSocialLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSocialConfirm}
                className="confirm-delete-btn"
                disabled={deleteSocialLoading}
              >
                {deleteSocialLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Social Media Modal */}
      {showEditSocialModal && socialToEdit && (
        <div className="modal-overlay">
          <div className="modal-content add-social-modal">
            <div className="modal-header">
              <h2>Edit Social Media</h2>
              <button
                onClick={handleEditSocialCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {editSocialErrors.general && (
                <div className="form-error general-error">
                  {editSocialErrors.general}
                </div>
              )}

              <form
                onSubmit={handleEditSocialSubmit}
                className="add-social-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_platform_name">Platform Name *</label>
                    <input
                      type="text"
                      id="edit_platform_name"
                      name="platform_name"
                      value={editSocialFormData.platform_name}
                      onChange={handleEditSocialInputChange}
                      placeholder="e.g., LinkedIn, Twitter, Facebook"
                      className={editSocialErrors.platform_name ? "error" : ""}
                    />
                    {editSocialErrors.platform_name && (
                      <span className="form-error">
                        {editSocialErrors.platform_name}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_page_url">Page URL *</label>
                    <input
                      type="url"
                      id="edit_page_url"
                      name="page_url"
                      value={editSocialFormData.page_url}
                      onChange={handleEditSocialInputChange}
                      placeholder="https://www.linkedin.com/company/omninov"
                      className={editSocialErrors.page_url ? "error" : ""}
                    />
                    {editSocialErrors.page_url && (
                      <span className="form-error">
                        {editSocialErrors.page_url}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={handleEditSocialCancel}
                className="cancel-btn"
                disabled={editSocialLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleEditSocialSubmit}
                className="confirm-add-btn"
                disabled={editSocialLoading}
              >
                {editSocialLoading ? "Updating..." : "Update Social Media"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay">
          <div className="modal-content add-social-modal">
            <div className="modal-header">
              <h2>Add Contact</h2>
              <button onClick={closeContactModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {contactErrors.general && (
                <div className="form-error general-error">
                  {contactErrors.general}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="add-social-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department *</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={contactFormData.department}
                      onChange={handleContactInputChange}
                      placeholder="e.g., Technical Support, Sales, HR"
                      className={contactErrors.department ? "error" : ""}
                    />
                    {contactErrors.department && (
                      <span className="form-error">
                        {contactErrors.department}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={contactFormData.phone_number}
                      onChange={handleContactInputChange}
                      placeholder="+1 (202) 555-0488"
                      className={contactErrors.phone_number ? "error" : ""}
                    />
                    {contactErrors.phone_number && (
                      <span className="form-error">
                        {contactErrors.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={closeContactModal}
                className="cancel-btn"
                disabled={contactLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleContactSubmit}
                className="confirm-add-btn"
                disabled={contactLoading}
              >
                {contactLoading ? "Adding..." : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {showDeleteContactModal && contactToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                onClick={handleDeleteContactCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>⚠️</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this contact?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{contactToDelete.department}</strong> contact.
                  </p>
                  <p className="delete-url">{contactToDelete.phone_number}</p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteContactCancel}
                className="cancel-btn"
                disabled={deleteContactLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContactConfirm}
                className="confirm-delete-btn"
                disabled={deleteContactLoading}
              >
                {deleteContactLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditContactModal && contactToEdit && (
        <div className="modal-overlay">
          <div className="modal-content add-social-modal">
            <div className="modal-header">
              <h2>Edit Contact</h2>
              <button
                onClick={handleEditContactCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {editContactErrors.general && (
                <div className="form-error general-error">
                  {editContactErrors.general}
                </div>
              )}

              <form
                onSubmit={handleEditContactSubmit}
                className="add-social-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_department">Department *</label>
                    <input
                      type="text"
                      id="edit_department"
                      name="department"
                      value={editContactFormData.department}
                      onChange={handleEditContactInputChange}
                      placeholder="e.g., Technical Support, Sales, HR"
                      className={editContactErrors.department ? "error" : ""}
                    />
                    {editContactErrors.department && (
                      <span className="form-error">
                        {editContactErrors.department}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_phone_number">Phone Number *</label>
                    <input
                      type="tel"
                      id="edit_phone_number"
                      name="phone_number"
                      value={editContactFormData.phone_number}
                      onChange={handleEditContactInputChange}
                      placeholder="+1 (202) 555-0488"
                      className={editContactErrors.phone_number ? "error" : ""}
                    />
                    {editContactErrors.phone_number && (
                      <span className="form-error">
                        {editContactErrors.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={handleEditContactCancel}
                className="cancel-btn"
                disabled={editContactLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleEditContactSubmit}
                className="confirm-add-btn"
                disabled={editContactLoading}
              >
                {editContactLoading ? "Updating..." : "Update Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Company;
