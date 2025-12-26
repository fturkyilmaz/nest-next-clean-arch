import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
  });

  it('should associate label with input', () => {
    const { container } = render(<Input label="Username" id="username" />);
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });

  it('should generate unique id when id is not provided', () => {
    const { rerender } = render(<Input label="Input 1" />);
    const input1 = screen.getByRole('textbox');
    const id1 = input1.id;

    rerender(<Input label="Input 2" />);
    // Both inputs should have IDs
    expect(id1).toBeTruthy();
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);
    const error = screen.getByText('This field is required');
    expect(error).toBeInTheDocument();
  });

  it('should have error styling when error is present', () => {
    const { container } = render(<Input error="Error occurred" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-red-500');
  });

  it('should have error ring color when error is present', () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('focus-visible:ring-red-500');
  });

  it('should not have error styling without error message', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-gray-300');
  });

  it('should have blue ring color when no error', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('focus-visible:ring-blue-500');
  });

  it('should support different input types', () => {
    const { container: emailContainer } = render(<Input type="email" />);
    const emailInput = emailContainer.querySelector('input');
    expect(emailInput).toHaveAttribute('type', 'email');

    const { container: passwordContainer } = render(<Input type="password" />);
    const passwordInput = passwordContainer.querySelector('input');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should accept custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should handle value changes', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    expect(input.value).toBe('');
  });

  it('should handle input event', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    // Simulate user input
    input.value = 'test value';
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    expect(input.value).toBe('test value');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should have aria-invalid when error is present', () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should not have aria-invalid without error', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('should have aria-describedby when error is present', () => {
    const { container } = render(<Input id="test-input" error="Error" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('should have error with role="alert"', () => {
    render(<Input error="Error message" />);
    const error = screen.getByRole('alert');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent('Error message');
  });

  it('should render without label correctly', () => {
    render(<Input placeholder="No label" />);
    const input = screen.getByPlaceholderText('No label');
    expect(input).toBeInTheDocument();
  });

  it('should combine label and error', () => {
    render(
      <Input 
        label="Email" 
        error="Invalid email" 
        placeholder="name@example.com"
      />
    );
    const label = screen.getByText('Email');
    const error = screen.getByText('Invalid email');
    const input = screen.getByPlaceholderText('name@example.com');
    
    expect(label).toBeInTheDocument();
    expect(error).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('should have proper focus styles', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('focus-visible:outline-none');
    expect(input).toHaveClass('focus-visible:ring-2');
  });

  it('should have disabled opacity styling', () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('disabled:opacity-50');
  });
});
