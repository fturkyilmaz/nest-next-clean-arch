import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Component', () => {
  describe('Card', () => {
    it('should render card element', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('should have card styling', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should accept custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should render children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should accept all HTML div attributes', () => {
      const { container } = render(
        <Card data-testid="test-card" id="card-id">
          Content
        </Card>
      );
      const card = container.querySelector('[data-testid="test-card"]');
      expect(card).toHaveAttribute('id', 'card-id');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild;
      expect(header).toBeInTheDocument();
    });

    it('should have header styling', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.querySelector('div');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('p-6');
    });

    it('should render with children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header">Header</CardHeader>
      );
      const header = container.querySelector('div');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
    });

    it('should have title styling', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
    });

    it('should render title text', () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardTitle className="custom-title">Title</CardTitle>
      );
      const title = container.querySelector('h3');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('CardDescription', () => {
    it('should render as p element', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toBeInTheDocument();
    });

    it('should have description styling', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-gray-500');
    });

    it('should render description text', () => {
      render(<CardDescription>This is a description</CardDescription>);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );
      const description = container.querySelector('p');
      expect(description).toHaveClass('custom-desc');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('Card with CardContent', () => {
    it('should render card content', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.firstChild;
      expect(content).toBeInTheDocument();
    });

    it('should have content styling', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.querySelector('div');
      expect(content).toHaveClass('p-6');
    });
  });

  describe('Card with CardFooter', () => {
    it('should render card footer', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild;
      expect(footer).toBeInTheDocument();
    });

    it('should have footer styling', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.querySelector('div');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('p-6');
    });
  });

  describe('Composed Card', () => {
    it('should work with all card parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should render full card structure', () => {
      const { container } = render(
        <Card data-testid="full-card">
          <CardHeader data-testid="card-header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="card-content">Content</CardContent>
          <CardFooter data-testid="card-footer">Footer</CardFooter>
        </Card>
      );

      expect(container.querySelector('[data-testid="full-card"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="card-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="card-content"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="card-footer"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading?.tagName).toBe('H3');
    });

    it('should be semantic HTML', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      // Should be div elements (which are semantic for card layout)
      const card = container.querySelector('div');
      expect(card).toBeInTheDocument();
    });
  });
});
