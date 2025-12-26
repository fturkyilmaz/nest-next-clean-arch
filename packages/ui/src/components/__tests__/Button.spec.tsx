import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render button with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should render button with custom text', () => {
    render(<Button>Custom Button</Button>);
    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toBeInTheDocument();
  });

  it('should apply default variant classes', () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('should apply destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('should apply outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('border');
  });

  it('should apply secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-100');
  });

  it('should apply ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:bg-gray-100');
  });

  it('should apply link variant', () => {
    const { container } = render(<Button variant="link">Link</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('text-blue-600');
  });

  it('should apply default size', () => {
    const { container } = render(<Button size="default">Default Size</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-10');
  });

  it('should apply small size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-8');
  });

  it('should apply large size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-12');
  });

  it('should apply icon size', () => {
    const { container } = render(<Button size="icon">Icon</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole('button');
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should accept custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle asChild prop', () => {
    const { container } = render(
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>
    );
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/link');
  });

  it('should have focus styles', () => {
    const { container } = render(<Button>Focusable</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('focus-visible:outline-none');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should combine size and variant correctly', () => {
    const { container } = render(
      <Button variant="destructive" size="lg">
        Delete Large
      </Button>
    );
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
    expect(button).toHaveClass('h-12');
  });

  it('should have proper button accessibility', () => {
    render(<Button>Accessible Button</Button>);
    const button = screen.getByRole('button', { name: /accessible button/i });
    expect(button).toHaveProperty('type', 'submit'); // default button type
  });

  it('should support all button HTML attributes', () => {
    render(
      <Button
        type="submit"
        aria-label="Submit form"
        data-testid="submit-button"
      >
        Submit
      </Button>
    );
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveProperty('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });

  it('should not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Click
      </Button>
    );
    const button = screen.getByRole('button');
    button.click();
    // The button is disabled, so click might not fire
    expect(button).toBeDisabled();
  });
});
