import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, user, loading } = useAuth();
  const toast = useToast();

  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectTo = searchParams.get('redirect') || '/listings';

  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true });
  }, [user, loading, navigate, redirectTo]);

  const signInForm = useForm({ resolver: zodResolver(signInSchema) });
  const signUpForm = useForm({ resolver: zodResolver(signUpSchema) });
  const activeForm = mode === 'signin' ? signInForm : signUpForm;

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate(redirectTo);
    } catch (err) {
      toast.error(err.message?.includes('popup') ? 'Sign-in popup was closed' : 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = activeForm.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(data.email, data.password);
        toast.success('Welcome back!');
      } else {
        await signupWithEmail(data.email, data.password, data.name);
        toast.success('Account created successfully!');
      }
      navigate(redirectTo);
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Incorrect password'
        : err.code === 'auth/user-not-found' ? 'No account found with this email'
        : err.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later'
        : err.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  });

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error('Please enter your email address'); return; }
    try {
      await resetPassword(forgotEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgot(false);
    } catch (err) {
      toast.error(err.code === 'auth/user-not-found' ? 'No account found with this email' : 'Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="w-10 h-10 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{mode === 'signin' ? 'Sign In' : 'Create Account'} – ReSpace</title>
      </Helmet>

      <div className="min-h-screen bg-brand-cream flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-baseline gap-1">
              <span className="text-brand-red text-3xl font-extrabold">Re</span>
              <span className="text-brand-dark text-3xl font-bold">Space</span>
            </Link>
            <p className="text-brand-muted text-sm mt-1">India's Commercial Space Rental Platform</p>
          </div>

          <div className="card shadow-card p-8">
            {/* Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              {[{ key: 'signin', label: 'Sign In' }, { key: 'signup', label: 'Sign Up' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setMode(key); activeForm.reset(); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === key ? 'bg-white shadow-sm text-brand-dark' : 'text-brand-muted hover:text-brand-dark'}`}
                  aria-pressed={mode === key}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Forgot password modal */}
            {showForgot ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Reset Password</h3>
                  <p className="text-sm text-brand-muted">Enter your email and we'll send a reset link.</p>
                </div>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  label="Email Address"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowForgot(false)} className="flex-1">Cancel</Button>
                  <Button variant="primary" onClick={handleForgotPassword} className="flex-1">Send Reset Link</Button>
                </div>
              </div>
            ) : (
              <>
                {/* Google Sign-In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 border border-brand-border rounded-xl py-3 text-sm font-semibold text-brand-dark hover:bg-gray-50 transition-all active:scale-[0.99] disabled:opacity-50"
                  id="google-signin-btn"
                  aria-label="Continue with Google"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-xs text-brand-muted font-medium">or</span>
                  <div className="flex-1 h-px bg-brand-border" />
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                  {mode === 'signup' && (
                    <Input
                      id="name"
                      label="Full Name"
                      placeholder="Priya Sharma"
                      required
                      error={signUpForm.formState.errors.name?.message}
                      {...signUpForm.register('name')}
                    />
                  )}

                  <Input
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    required
                    error={activeForm.formState.errors.email?.message}
                    {...activeForm.register('email')}
                  />

                  <div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="••••••••"
                      required
                      error={activeForm.formState.errors.password?.message}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="text-brand-muted hover:text-brand-dark transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      {...activeForm.register('password')}
                    />
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-brand-red hover:underline mt-1.5 float-right"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="••••••••"
                      required
                      error={signUpForm.formState.errors.confirmPassword?.message}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      {...signUpForm.register('confirmPassword')}
                    />
                  )}

                  <div className="pt-1">
                    <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </Button>
                  </div>
                </form>

                <p className="text-center text-xs text-brand-muted mt-5">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); activeForm.reset(); }}
                    className="text-brand-red font-semibold hover:underline"
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs text-brand-muted mt-4">
            By signing in, you agree to our{' '}
            <Link to="/" className="text-brand-red hover:underline">Terms</Link> and{' '}
            <Link to="/" className="text-brand-red hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
