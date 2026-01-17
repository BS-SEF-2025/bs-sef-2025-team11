import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// In development, use Vite proxy (empty string). In production, use VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || "";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);

  // This effect only runs on mount to load initial user state
  useEffect(() => {
    console.log('🔑 AuthProvider: Initial mount - checking for existing session...');

    const token = localStorage.getItem("token");
    console.log('🔑 Token in localStorage:', !!token);

    if (!token) {
      console.log('🔑 No token found, user is not logged in');
      setLoading(false);
      setUser(null);
      return;
    }

    // If we have a token, try to load user
    // But only if we don't already have a user (to prevent re-verification)
    if (!user) {
      console.log('🔑 Token found but no user, loading user from token...');
      // Pass justRegistered flag to loadUserFromToken
      const currentJustRegistered = justRegistered;
      loadUserFromToken(currentJustRegistered).catch((error) => {
        console.error('Error in loadUserFromToken:', error);
        setLoading(false);
      });
    } else {
      console.log('🔑 User already set, skipping initial load');
      setLoading(false);
    }
  }, []); // Only run on mount

  // Separate effect to handle justRegistered flag clearing
  useEffect(() => {
    if (justRegistered) {
      console.log('🔑 justRegistered flag is true, will clear in 5 seconds');
      const timer = setTimeout(() => {
        console.log('🔑 Clearing justRegistered flag');
        setJustRegistered(false);
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [justRegistered]);

  const loadUserFromToken = async (skipOnError = false) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Use skipOnError parameter to prevent token removal if we just registered
        console.log('🔑 loadUserFromToken: skipOnError =', skipOnError);
        await fetchUser(token, skipOnError);
      } else {
        setLoading(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error in loadUserFromToken:', error);
      // Don't remove token on error - it might still be valid
      // Only set loading to false
      setLoading(false);
      // Keep user as null if we couldn't load it, but don't remove token
    }
  };

  const fetchUser = async (token, skipOnError = false) => {
    try {
      const url = API_BASE ? `${API_BASE}/api/auth/me` : '/api/auth/me';
      console.log('Fetching user from:', url);
      console.log('Token exists:', !!token);
      console.log('Skip on error:', skipOnError);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('User fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded user from token:', data.user);
        setUser(data.user);
      } else if (response.status === 401) {
        // Only remove token on actual 401 Unauthorized (invalid/expired token)
        // BUT: if skipOnError is true (e.g., right after registration), don't remove token
        if (skipOnError) {
          console.warn('Token verification failed (401), but skipping removal because skipOnError=true');
          // Keep the existing user if we have one
          return;
        }
        console.warn('Token is invalid or expired (401), removing token');
        localStorage.removeItem("token");
        setUser(null);
      } else {
        // For other errors (500, network issues, etc.), keep the token and existing user
        // The user might still be valid, just the server had an issue
        console.warn('Failed to fetch user, but keeping token and existing user state. Status:', response.status);
        // Don't remove token or clear user on non-401 errors
        // If user was already set (e.g., from registration), keep it
      }
    } catch (e) {
      console.error('Error fetching user:', e);
      // If it's a network error or timeout, DON'T remove the token
      // The token might still be valid, we just couldn't reach the server
      if (e.name === 'AbortError' || e.message.includes('Failed to fetch')) {
        console.warn('Backend not reachable, but keeping token in case it\'s still valid');
        // Don't remove token on network errors - it might still be valid
      } else if (!skipOnError) {
        // Only remove token on unexpected errors if we're not skipping
        console.error('Unexpected error, removing token');
        localStorage.removeItem("token");
        setUser(null);
      } else {
        console.warn('Unexpected error, but skipping token removal because skipOnError=true');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login:', email);
      console.log('API_BASE:', API_BASE || '(using proxy)');
      const url = API_BASE ? `${API_BASE}/api/auth/login` : '/api/auth/login';
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || `Login failed with status ${response.status}` };
        }
        console.error('Login error response:', error);
        throw new Error(error.message || "Login failed");
      }

      const data = JSON.parse(responseText);
      console.log('Login successful, token received:', data.token ? 'Yes' : 'No');
      if (!data.token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem("token", data.token);
      console.log('Token stored in localStorage:', !!localStorage.getItem("token"));
      console.log('User data received:', data.user);
      setUser(data.user);
      // Verify token was stored correctly
      const storedToken = localStorage.getItem("token");
      if (!storedToken || storedToken !== data.token) {
        console.error('Token storage verification failed!');
        throw new Error('Failed to store authentication token');
      }
      console.log('Token storage verified successfully');
      return data;
    } catch (e) {
      console.error('Login error:', e);
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Make sure the backend is running on http://127.0.0.1:8000');
      }
      throw e;
    }
  };

  const register = async (email, password) => {
    try {
      console.log('Attempting registration:', email);
      console.log('API_BASE:', API_BASE || '(using Vite proxy)');
      const url = API_BASE ? `${API_BASE}/api/auth/register` : '/api/auth/register';
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || `Registration failed with status ${response.status}` };
        }
        console.error('Registration error:', error);
        throw new Error(error.message || "Registration failed");
      }

      const data = JSON.parse(responseText);
      if (!data.token) {
        throw new Error('No token received from server');
      }

      // Ensure token is a clean string
      let tokenToStore = data.token;
      if (typeof tokenToStore !== 'string') {
        tokenToStore = String(tokenToStore);
      }
      tokenToStore = tokenToStore.trim();

      // Store token first
      localStorage.setItem("token", tokenToStore);
      console.log('✅ Token stored after registration');
      console.log('Token type:', typeof tokenToStore);
      console.log('Token length:', tokenToStore.length);
      console.log('Token value (first 50 chars):', tokenToStore.substring(0, 50) + '...');

      // Verify it was stored correctly
      const verifyStored = localStorage.getItem("token");
      if (verifyStored !== tokenToStore) {
        console.error('❌ Token storage mismatch!');
        console.error('Expected:', tokenToStore.substring(0, 50));
        console.error('Got:', verifyStored?.substring(0, 50));
        throw new Error('Token storage failed');
      }
      console.log('✅ Token storage verified');

      // Verify token was stored immediately
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        console.error('Token storage verification failed - token is null!');
        throw new Error('Failed to store authentication token');
      }
      if (storedToken !== data.token) {
        console.error('Token storage verification failed - tokens do not match!');
        console.error('Expected:', data.token.substring(0, 30));
        console.error('Got:', storedToken.substring(0, 30));
        throw new Error('Token storage verification failed');
      }
      console.log('Token storage verified successfully');

      // CRITICAL: Set justRegistered flag FIRST, before setting user
      // This prevents useEffect from trying to verify token
      setJustRegistered(true);
      console.log('🔑 Just registered flag set to TRUE (before setting user)');

      // Set user state immediately - don't wait
      let userData = data.user;
      if (userData) {
        // Set user state synchronously
        setUser(userData);
        console.log('✅ User state set synchronously after registration:', userData?.email);
        console.log('User role:', userData?.role);
      } else {
        // If no user in response, fetch it using the token we just stored
        console.log('No user in registration response, fetching user with stored token...');
        const verifyToken = localStorage.getItem("token");
        if (verifyToken) {
          // Use skipOnError=true to prevent token removal if verification fails
          try {
            const url = API_BASE ? `${API_BASE}/api/auth/me` : '/api/auth/me';
            const verifyResponse = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${verifyToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              userData = verifyData.user;
              setUser(userData);
              console.log('✅ User fetched and set after registration:', userData?.email);
            } else {
              console.warn('Failed to fetch user, but keeping token (skipOnError=true)');
              // Create a minimal user object from registration data
              userData = {
                email: email,
                role: 'student',
                id: null, // Will be set when we can fetch properly
              };
              setUser(userData);
            }
          } catch (fetchError) {
            console.warn('Error fetching user after registration, but keeping token:', fetchError);
            // Create a minimal user object
            userData = {
              email: email,
              role: 'student',
              id: null,
            };
            setUser(userData);
          }
        } else {
          console.error('Token was lost before we could fetch user!');
          throw new Error('Token was lost during registration');
        }
      }

      // Final verification
      const finalToken = localStorage.getItem("token");
      console.log('Final check - Token exists:', !!finalToken);
      console.log('Final check - User exists:', !!userData);
      console.log('Final check - User email:', userData?.email || 'none');

      // Ensure userData is in the return value
      if (!userData) {
        throw new Error('User data was not set during registration');
      }

      console.log('✅ Registration successful, user:', userData.email);
      return { ...data, user: userData };
    } catch (e) {
      console.error('Registration error:', e);
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('fetch') || e.message.includes('Network error')) {
        throw new Error('Cannot connect to server. Make sure the backend is running on http://127.0.0.1:8000');
      }
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const setRole = async (role, reason = "", managerType = "") => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Clean the token
      token = token.trim();

      console.log('🔑 setRole - role:', role);
      console.log('🔑 setRole - token exists:', !!token);
      console.log('🔑 setRole - token length:', token.length);

      const url = API_BASE ? `${API_BASE}/api/auth/set-role` : '/api/auth/set-role';
      const requestBody = JSON.stringify({ role, reason, manager_type: managerType });

      console.log('🔑 Calling:', url);
      console.log('🔑 Body:', requestBody);

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: requestBody,
      });

      const responseText = await response.text();
      console.log('📡 Response status:', response.status);
      console.log('📡 Response text:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || `Failed to set role (status ${response.status})` };
        }

        console.error('❌ Error:', error.message);
        console.error('❌ Status:', response.status);

        if (response.status === 401) {
          // If we just registered, retry once after a delay
          if (justRegistered) {
            console.warn('⚠️ 401 after registration - retrying...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            const retryResponse = await fetch(url, {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: requestBody,
            });

            const retryText = await retryResponse.text();
            if (retryResponse.ok) {
              const retryData = JSON.parse(retryText);
              if (retryData.user) setUser(retryData.user);
              return retryData;
            }

            // Retry failed - show backend error
            let retryError;
            try {
              retryError = JSON.parse(retryText);
            } catch {
              retryError = { message: retryText };
            }
            throw new Error(retryError.message || "Failed to set role. Please refresh the page and try again.");
          } else {
            localStorage.removeItem("token");
            setUser(null);
            throw new Error("Your session has expired. Please log in again.");
          }
        } else if (response.status === 400) {
          throw new Error(error.message || "Invalid request. Please check your input.");
        } else {
          throw new Error(error.message || "Failed to set role");
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from server");
      }

      console.log('Role set response:', data);

      // Update user context with new role - this ensures it persists
      if (data.user) {
        setUser(data.user);
        console.log('User state updated with new role:', data.user.role);
      } else {
        // If server didn't return user, refresh it
        // Use skipOnError=true if we just registered to prevent token removal
        await fetchUser(token, justRegistered);
      }
      return data;
    } catch (e) {
      console.error('Error setting role:', e);
      // Re-throw the error with the specific message we set above
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
