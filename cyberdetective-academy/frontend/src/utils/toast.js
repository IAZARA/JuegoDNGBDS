import toast from 'react-hot-toast';

// Wrapper to ensure toast methods are always available
const safeToast = {
  success: (message, options) => {
    if (toast && typeof toast.success === 'function') {
      return toast.success(message, options);
    }
    console.log('Toast success:', message);
  },
  
  error: (message, options) => {
    if (toast && typeof toast.error === 'function') {
      return toast.error(message, options);
    }
    console.error('Toast error:', message);
  },
  
  info: (message, options) => {
    if (toast && typeof toast === 'function') {
      // react-hot-toast doesn't have a built-in info method, use default toast
      return toast(message, { icon: 'ℹ️', ...options });
    }
    console.info('Toast info:', message);
  },
  
  warning: (message, options) => {
    if (toast && typeof toast === 'function') {
      return toast(message, { icon: '⚠️', ...options });
    }
    console.warn('Toast warning:', message);
  },
  
  loading: (message, options) => {
    if (toast && typeof toast.loading === 'function') {
      return toast.loading(message, options);
    }
    console.log('Toast loading:', message);
  },
  
  dismiss: (toastId) => {
    if (toast && typeof toast.dismiss === 'function') {
      return toast.dismiss(toastId);
    }
  }
};

// Preserve original toast methods if needed
Object.setPrototypeOf(safeToast, toast);

export default safeToast;