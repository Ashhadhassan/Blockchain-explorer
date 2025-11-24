/**
 * API Client
 * Provides a centralized HTTP client for making API requests to the backend
 * @module api-client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Custom API Error class
 * Extends Error to include HTTP status information
 */
class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Make an API request with error handling
 * @template T - Response type
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {RequestInit} options - Fetch API options
 * @returns {Promise<T>} Parsed JSON response
 * @throws {ApiError} If the request fails or returns an error status
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If not JSON, get text to see what we got
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      throw new ApiError(
        response.status,
        response.statusText,
        { message: "Server returned non-JSON response", body: text.substring(0, 200) }
      );
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes("JSON")) {
      throw new Error(`Network error: Server returned invalid JSON. Check if backend is running on ${API_URL}`);
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * API client object with HTTP methods
 */
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};

export { ApiError };

