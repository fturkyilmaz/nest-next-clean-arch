import { notify, showApiError, showValidationError } from '@/lib/toast';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

describe('Toast Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notify object', () => {
    it('should call toast.success for success notification', () => {
      notify.success('Test success message');
      
      expect(toast.success).toHaveBeenCalledWith(
        'Test success message',
        expect.objectContaining({
          position: 'bottom-right',
          autoClose: 3000,
        })
      );
    });

    it('should call toast.error for error notification', () => {
      notify.error('Test error message');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Test error message',
        expect.objectContaining({
          position: 'bottom-right',
          autoClose: 5000,
        })
      );
    });

    it('should call toast.info for info notification', () => {
      notify.info('Test info message');
      
      expect(toast.info).toHaveBeenCalledWith(
        'Test info message',
        expect.objectContaining({
          position: 'bottom-right',
          autoClose: 3000,
        })
      );
    });

    it('should call toast.warning for warning notification', () => {
      notify.warning('Test warning message');
      
      expect(toast.warning).toHaveBeenCalledWith(
        'Test warning message',
        expect.objectContaining({
          position: 'bottom-right',
          autoClose: 4000,
        })
      );
    });

    it('should call toast.loading for loading notification', () => {
      notify.loading('Test loading message');
      
      expect(toast.loading).toHaveBeenCalledWith(
        'Test loading message',
        expect.objectContaining({
          position: 'bottom-right',
        })
      );
    });
  });

  describe('showApiError', () => {
    it('should show error with detail field', () => {
      const error = {
        detail: 'API Error Details',
      };

      showApiError(error);

      expect(toast.error).toHaveBeenCalledWith(
        'API Error Details',
        expect.any(Object)
      );
    });

    it('should show error with message field', () => {
      const error = {
        message: 'Error message',
      };

      showApiError(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Error message',
        expect.any(Object)
      );
    });

    it('should show error with title field', () => {
      const error = {
        title: 'Error title',
      };

      showApiError(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Error title',
        expect.any(Object)
      );
    });

    it('should show error with string', () => {
      const error = 'String error';

      showApiError(error);

      expect(toast.error).toHaveBeenCalledWith(
        'String error',
        expect.any(Object)
      );
    });

    it('should show default error message if no field provided', () => {
      const error = {};

      showApiError(error);

      expect(toast.error).toHaveBeenCalledWith(
        'An unexpected error occurred',
        expect.any(Object)
      );
    });
  });

  describe('showValidationError', () => {
    it('should show validation errors formatted correctly', () => {
      const errors = {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password must be at least 8 characters'],
      };

      showValidationError(errors);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('email:'),
        expect.any(Object)
      );
    });

    it('should show default message if errors is empty', () => {
      const errors = {};

      showValidationError(errors);

      expect(toast.error).toHaveBeenCalledWith(
        'Validation failed',
        expect.any(Object)
      );
    });
  });
});
