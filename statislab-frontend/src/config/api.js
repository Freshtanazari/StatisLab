// const DEFAULT_API_URL = "https://freshta-statislab.hf.space";
const DEFAULT_API_URL = "http://localhost:8000";

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Needed for backend session security (cookie-based session ownership checks).
export const API_REQUEST_CONFIG = {
	withCredentials: true,
};