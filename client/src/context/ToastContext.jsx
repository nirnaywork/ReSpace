import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.toast];
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
};

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-brand-success" />,
  error: <AlertCircle className="w-5 h-5 text-brand-error" />,
  warning: <AlertTriangle className="w-5 h-5 text-brand-warn" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const BG_COLORS = {
  success: 'border-l-4 border-brand-success',
  error: 'border-l-4 border-brand-error',
  warning: 'border-l-4 border-brand-warn',
  info: 'border-l-4 border-blue-400',
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    dispatch({ type: 'ADD_TOAST', toast: { id, type, message } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const toast = {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    warning: (message) => addToast({ type: 'warning', message }),
    info: (message) => addToast({ type: 'info', message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-6 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card px-4 py-3.5 flex items-start gap-3 animate-slide-in-right shadow-lg ${BG_COLORS[t.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{ICONS[t.type]}</div>
            <p className="text-sm text-brand-dark flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-brand-muted hover:text-brand-dark transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
