import toast from 'react-hot-toast';

/**
 * Utility functions for toast notifications
 */

export const showToast = {
  success: (message) => {
    toast.success(message);
  },
  
  error: (message) => {
    toast.error(message);
  },
  
  loading: (message) => {
    return toast.loading(message);
  },
  
  promise: async (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: (err) => messages.error || err?.response?.data?.message || err?.message || 'Error occurred',
    });
  },
  
  info: (message) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },
  
  warning: (message) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },
  
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  
  custom: (message, options) => {
    toast.custom(message, options);
  },
};

export default showToast;
