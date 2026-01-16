import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Use environment variable for deployed backend, or Vite proxy for local dev
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "http://127.0.0.1:8000");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔑 AuthProvider: Starting to load user...');
    
    // Safety timeout - ensure loading never hangs forever
    const timeout = setTimeout(() => {
      console.warn('⚠️ AuthProvider: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 2000); // 2 second max loading time
    
    // Load user with error handling
    loadUserFromToken().catch((error) => {
      console.error('Error in loadUserFromToken:', error);
      setLoading(false);
    });
    
    return () => clearTimeout(timeout);
  }, []);

  const loadUserFromToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchUser(token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in loadUserFromToken:', error);
      setLoading(false);
      setUser(null);
    }
  };

  const fetchUser = async (token) => {
    try {
      const url = API_BASE ? `${API_BASE}/api/auth/me` : '/api/auth/me';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded user from token:', data.user);
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (e) {
      console.error('Error fetching user:', e);
      // If it's a network error or timeout, just clear and continue
      if (e.name === 'AbortError' || e.message.includes('Failed to fetch')) {
        console.warn('Backend not reachable, continuing without user');
      }
      localStorage.removeItem("token");
      setUser(null);
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
      
      // First, test if backend is reachable
      try {
        const testUrl = API_BASE ? `${API_BASE}/api/test` : '/api/test';
        const testResponse = await fetch(testUrl, { method: 'GET' });
        console.log('Backend connectivity test:', testResponse.ok ? 'OK' : 'FAILED');
        if (!testResponse.ok) {
          throw new Error('Backend test failed');
        }
      } catch (testError) {
        console.error('Backend not reachable:', testError);
        throw new Error('Cannot connect to server. Make sure the backend is running on http://127.0.0.1:8000');
      }
      
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
      setUser(data.user);
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
      console.log('API_BASE:', API_BASE || '(using proxy)');
      const url = API_BASE ? `${API_BASE}/api/auth/register` : '/api/auth/register';
      console.log('Request URL:', url);
      
      // First, test if backend is reachable
      try {
        const testUrl = API_BASE ? `${API_BASE}/api/test` : '/api/test';
        const testResponse = await fetch(testUrl, { method: 'GET' });
        console.log('Backend connectivity test:', testResponse.ok ? 'OK' : 'FAILED');
        if (!testResponse.ok) {
          throw new Error('Backend test failed');
        }
      } catch (testError) {
        console.error('Backend not reachable:', testError);
        throw new Error('Cannot connect to server. Make sure the backend is running on http://127.0.0.1:8000');
      }
      
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || `Registration failed with status ${response.status}` };
        }
        console.error('Registration error response:', error);
        throw new Error(error.message || "Registration failed");
      }

      const data = JSON.parse(responseText);
      console.log('Registration successful, token received:', data.token ? 'Yes' : 'No');
      if (!data.token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data;
    } catch (e) {
      console.error('Registration error:', e);
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const url = API_BASE ? `${API_BASE}/api/auth/set-role` : '/api/auth/set-role';
      console.log('Setting role:', role, 'URL:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, reason, manager_type: managerType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set role");
      }

      const data = await response.json();
      console.log('Role set response:', data);
      
      // Update user context with new role - this ensures it persists
      if (data.user) {
        setUser(data.user);
        // Also reload user from token to ensure consistency
        await loadUserFromToken();
      }
      return data;
    } catch (e) {
      console.error('Error setting role:', e);
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
