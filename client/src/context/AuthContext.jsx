import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from '../utils/firebase';
import api from '../utils/api';

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { user: null, userProfile: null, loading: false, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const syncUserWithBackend = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      const res = await api.post('/api/auth/register', {
        photoURL: firebaseUser.photoURL || '',
      });
      if (res.data.success) {
        dispatch({ type: 'SET_PROFILE', payload: res.data.data.user });
      }
    } catch (err) {
      console.error('Backend sync error:', err.message);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        dispatch({ type: 'SET_USER', payload: firebaseUser });
        await syncUserWithBackend(firebaseUser);
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => unsubscribe();
  }, [syncUserWithBackend]);

  const loginWithGoogle = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signupWithEmail = async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      return result.user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    try {
      const res = await api.get('/api/auth/me');
      if (res.data.success) {
        dispatch({ type: 'SET_PROFILE', payload: res.data.data.user });
      }
    } catch (err) {
      console.error('Profile refresh error:', err.message);
    }
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const addRole = async (role) => {
    try {
      const res = await api.post('/api/auth/add-role', { role });
      if (res.data.success) {
        dispatch({ type: 'SET_PROFILE', payload: res.data.data.user });
      }
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user: state.user,
    userProfile: state.userProfile,
    loading: state.loading,
    error: state.error,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    refreshProfile,
    resetPassword,
    addRole,
    isOwner: state.userProfile?.roles?.includes('owner'),
    isRenter: state.userProfile?.roles?.includes('renter'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
