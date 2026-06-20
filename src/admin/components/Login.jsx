import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, setTokenWithExpiration } from "../utils/auth";
import Footer from "./Footer";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [logoVersion, setLogoVersion] = useState(Date.now());

  useEffect(() => {
    const handleLogoUpdate = (event) => {
      setLogoVersion(event.detail.version);
    };

    window.addEventListener("logoUpdated", handleLogoUpdate);
    return () => window.removeEventListener("logoUpdated", handleLogoUpdate);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginUser(formData.email, formData.password);

      if (data.access_token) {
        // Use new token management with automatic refresh scheduling
        setTokenWithExpiration(data);

        // Store additional user info
        localStorage.setItem(
          "user",
          JSON.stringify({
            message: data.message,
            token_type: data.token_type,
            expires_in: data.expires_in,
          }),
        );

        // Redirect to admin profile
        navigate("/admin/admin-profile");
      } else {
        throw new Error("No access token received from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            {logoError ? (
              <div className="logo-error">
                <span style={{ fontSize: "24px" }}>🏢</span>
              </div>
            ) : (
              <img
                src={`http://omninovawai/images/company/company_logo.png?v=${logoVersion}`}
                alt="OmniNova Logo"
                className="login-logo-image"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <p>Admin Dashboard</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
