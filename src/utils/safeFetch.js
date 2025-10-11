/**
 * Safe Fetch Wrapper with Error Handling
 * 
 * This utility provides consistent error handling for all fetch calls
 * and prevents common issues like network errors, timeouts, and invalid responses.
 */

/**
 * Performs a fetch request with built-in error handling
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {Object} config - Additional configuration
 * @param {number} config.timeout - Request timeout in milliseconds (default: 30000)
 * @param {Function} config.onError - Custom error handler
 * @param {boolean} config.showToast - Show error toast to user (default: false)
 * @returns {Promise<{data: any, error: Error | null, ok: boolean}>}
 */
export async function safeFetch(url, options = {}, config = {}) {
  const {
    timeout = 30000,
    onError = null,
    showToast = false,
  } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText || 'Request failed'
      }));

      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      error.data = errorData;

      if (onError) {
        onError(error);
      }

      if (showToast && typeof window !== 'undefined') {
        console.error(`Fetch error (${response.status}):`, error.message);
      }

      return { data: null, error, ok: false, status: response.status };
    }

    // Try to parse JSON response
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { data, error: null, ok: true, status: response.status };

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle specific error types
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`);
      timeoutError.code = 'TIMEOUT';
      
      if (onError) {
        onError(timeoutError);
      }

      return { data: null, error: timeoutError, ok: false, status: 0 };
    }

    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      error.code = 'NETWORK_ERROR';
      error.message = 'Network error. Please check your connection.';
    }

    if (onError) {
      onError(error);
    }

    if (showToast && typeof window !== 'undefined') {
      console.error('Fetch error:', error.message);
    }

    return { data: null, error, ok: false, status: 0 };
  }
}

/**
 * Safe GET request
 */
export async function safeGet(url, config = {}) {
  return safeFetch(url, { method: 'GET' }, config);
}

/**
 * Safe POST request
 */
export async function safePost(url, body = null, config = {}) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return safeFetch(url, options, config);
}

/**
 * Safe PUT request
 */
export async function safePut(url, body = null, config = {}) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return safeFetch(url, options, config);
}

/**
 * Safe PATCH request
 */
export async function safePatch(url, body = null, config = {}) {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return safeFetch(url, options, config);
}

/**
 * Safe DELETE request
 */
export async function safeDelete(url, config = {}) {
  return safeFetch(url, { method: 'DELETE' }, config);
}

/**
 * Retry a fetch request with exponential backoff
 */
export async function retryFetch(url, options = {}, maxRetries = 3, config = {}) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    const result = await safeFetch(url, options, config);
    
    if (result.ok) {
      return result;
    }

    lastError = result.error;

    // Don't retry on client errors (4xx)
    if (result.status >= 400 && result.status < 500) {
      break;
    }

    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { data: null, error: lastError, ok: false, status: 0 };
}

export default safeFetch;

