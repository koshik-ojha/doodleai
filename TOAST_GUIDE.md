# Toast Notifications Guide

## Overview

Toast notifications have been integrated throughout the application using `react-hot-toast`. This provides a consistent way to show success messages, errors, warnings, and loading states to users.

## Basic Usage

### Import the toast utility

```javascript
import showToast from '@/utils/toast';
```

### Available Methods

#### 1. Success Toast
```javascript
showToast.success("Operation completed successfully!");
```

#### 2. Error Toast
```javascript
showToast.error("Something went wrong!");
```

#### 3. Info Toast
```javascript
showToast.info("Here's some information");
```

#### 4. Warning Toast
```javascript
showToast.warning("Please be careful!");
```

#### 5. Loading Toast
```javascript
const toastId = showToast.loading("Processing...");
// Later dismiss it
showToast.dismiss(toastId);
```

#### 6. Promise Toast (Automatic loading/success/error)
```javascript
const saveData = async () => {
  return api.post('/endpoint', data);
};

await showToast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Data saved successfully!',
  error: 'Failed to save data',
});
```

## Examples in Different Scenarios

### 1. Form Submissions

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await api.post('/submit', formData);
    showToast.success('Form submitted successfully!');
    router.push('/dashboard');
  } catch (error) {
    // Error toast is automatically shown by API interceptor
    console.error(error);
  }
};
```

### 2. Delete Operations

```javascript
const handleDelete = async (id) => {
  try {
    await showToast.promise(
      api.delete(`/item/${id}`),
      {
        loading: 'Deleting...',
        success: 'Item deleted successfully!',
        error: 'Failed to delete item',
      }
    );
    // Refresh data after deletion
    fetchData();
  } catch (error) {
    console.error(error);
  }
};
```

### 3. File Uploads

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const toastId = showToast.loading('Uploading file...');
  
  try {
    await api.post('/upload', formData);
    showToast.dismiss(toastId);
    showToast.success('File uploaded successfully!');
  } catch (error) {
    showToast.dismiss(toastId);
    // Error toast shown by API interceptor
  }
};
```

### 4. Copy to Clipboard

```javascript
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  showToast.success('Copied to clipboard!');
};
```

### 5. Settings Updates

```javascript
const updateSettings = async (settings) => {
  try {
    await showToast.promise(
      api.put('/settings', settings),
      {
        loading: 'Updating settings...',
        success: 'Settings updated successfully!',
        error: 'Failed to update settings',
      }
    );
  } catch (error) {
    console.error(error);
  }
};
```

### 6. Login/Authentication

```javascript
const handleLogin = async (credentials) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    showToast.success('Welcome back!');
    router.push('/dashboard');
  } catch (error) {
    // Error toast shown by API interceptor
  }
};
```

## Automatic Error Handling

The API interceptor in `frontend/lib/api.js` automatically shows error toasts for all failed API requests. You don't need to manually show error toasts in most cases.

```javascript
// In api.js - already configured
api.interceptors.response.use(
  (response) => {
    if (response.data?.message && response.config.method !== 'get') {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        "An error occurred";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);
```

## Custom Styling

You can customize toast appearance when calling them:

```javascript
showToast.success('Custom styled toast!', {
  duration: 5000,
  style: {
    background: '#10b981',
    color: '#fff',
    borderRadius: '12px',
  },
  iconTheme: {
    primary: '#fff',
    secondary: '#10b981',
  },
});
```

## Global Configuration

Toast global settings are configured in `ClientLayout.jsx`:

```javascript
<Toaster 
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 4000,
    style: {
      background: '#333',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
```

## Best Practices

1. **Use appropriate toast types**: Success for successful operations, error for failures, warning for cautions
2. **Keep messages concise**: Short, clear messages work best
3. **Don't overuse**: Not every action needs a toast
4. **Rely on API interceptor**: Let the interceptor handle most error toasts
5. **Use promise toast for async operations**: It automatically handles loading/success/error states
6. **Dismiss loading toasts**: Always dismiss loading toasts when the operation completes

## Components Already Updated

- ✅ `ClientLayout.jsx` - Toaster component added
- ✅ `lib/api.js` - Automatic error/success toasts
- ✅ `components/AuthForm.jsx` - Login/Register toasts
- ✅ `components/ChatbotForm.jsx` - Form submission toasts
- ✅ `utils/toast.js` - Toast utility functions

## Next Steps

You can now use toasts in any component by importing the utility:

```javascript
import showToast from '@/utils/toast';
```

All API errors will automatically show as toasts, and you can manually trigger toasts for user interactions, validations, and other events throughout your application.
