import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('=== REGISTER ATTEMPT ===');
      const result = await register(email, password);
      console.log('=== REGISTER SUCCESS ===');
      console.log('Registration result:', result);
      
      // Verify token is stored
      const token = localStorage.getItem("token");
      console.log('Token after registration:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
      
      if (!token) {
        throw new Error('Token was not stored properly. Please try again.');
      }
      
      // Verify user is in the result
      if (!result.user) {
        throw new Error('User data was not received. Please try again.');
      }
      
      console.log('User from registration:', result.user);
      
      // CRITICAL: Wait for user state to be set in AuthContext
      // Poll for user state to be set (with timeout) - check the user from context
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds max wait
      let finalUser = user || result.user;
      
      while (!finalUser && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        // The user state should be set by now from the register function
        // But we'll check localStorage and result as fallback
        finalUser = user || result.user;
      }
      
      // Double-check that token and user are still there
      const finalToken = localStorage.getItem("token");
      
      if (!finalToken) {
        throw new Error('Token was lost after registration. Please try again.');
      }
      
      if (!finalUser) {
        // Last resort: use the user from result
        console.warn('User not in context, using user from registration result');
        if (!result.user) {
          throw new Error('User data was lost after registration. Please try again.');
        }
        finalUser = result.user;
      }
      
      console.log('Final check - Token exists:', !!finalToken);
      console.log('Final check - User exists:', !!finalUser);
      console.log('Final check - User email:', finalUser?.email);
      
      toast.success('Registration successful!');
      
      // Small delay to ensure state is fully propagated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate to role selection - the user should be authenticated
      // Use replace: true to prevent back button from going to register page
      console.log('Navigating to role-selection...');
      navigate('/role-selection', { replace: true });
    } catch (error) {
      console.error('=== REGISTER ERROR ===', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Campus Navigator</h1>
          <p className="text-slate-600">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
