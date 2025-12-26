'use client';

import { toast, ToastContainer as Toaster, ToastOptions } from 'react-toastify';

export { Toaster };

export const notify = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      position: 'bottom-right',
      autoClose: 3000,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast.info(message, {
      position: 'bottom-right',
      autoClose: 3000,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, {
      position: 'bottom-right',
      autoClose: 4000,
      ...options,
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, {
      position: 'bottom-right',
      ...options,
    }),
};

export const showApiError = (error: any) => {
  let message = 'An unexpected error occurred';

  if (error?.detail) {
    message = error.detail;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.title) {
    message = error.title;
  } else if (typeof error === 'string') {
    message = error;
  }

  notify.error(message);
};

export const showValidationError = (errors: Record<string, string[]>) => {
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');

  notify.error(errorMessages || 'Validation failed');
};
