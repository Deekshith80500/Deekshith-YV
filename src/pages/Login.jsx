import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, UserRoundIcon as UserDoctor, Mail, Lock, AlertCircle, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { loginWithGoogle, signupWithEmail, loginWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('patient');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      sessionStorage.setItem('intended_role', role);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Login is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login window was closed. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      sessionStorage.setItem('intended_role', role);
      if (isSignup) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">MedVault</h2>
          <p className="mt-2 text-sm text-gray-500">Your portable medical identity</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 text-center">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                role === 'patient' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400'
              }`}
            >
              <User size={18} /> Patient
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                role === 'doctor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400'
              }`}
            >
              <UserDoctor size={18} /> Doctor
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-700 text-sm">
            <AlertCircle className="shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleManualAuth} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-white text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          <Chrome size={20} />
          Google
        </button>

        <div className="text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400">
          Powered by MedVault Security
        </p>
      </motion.div>
    </div>
  );
}
