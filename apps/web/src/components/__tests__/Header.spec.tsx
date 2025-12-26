import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Header Component', () => {
  it('should render header element', () => {
    render(<Header />);
    const header = screen.getByRole('contentinfo', { hidden: true }) || document.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should display site title', () => {
    render(<Header />);
    const title = screen.getByText('Nest-Next Clean Arch');
    expect(title).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    render(<Header />);
    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });
    
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  it('should have correct href for home link', () => {
    render(<Header />);
    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have correct href for about link', () => {
    render(<Header />);
    const aboutLink = screen.getByRole('link', { name: /About/i });
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('should have title link to home', () => {
    render(<Header />);
    const titleLink = screen.getByRole('link', { name: /Nest-Next Clean Arch/i });
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('should have gradient background styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-gradient-to-r');
    expect(header).toHaveClass('from-purple-900');
    expect(header).toHaveClass('to-indigo-700');
  });

  it('should have proper text styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('text-white');
  });

  it('should have shadow styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('shadow-lg');
  });

  it('should render navigation element', () => {
    const { container } = render(<Header />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should have navigation styling', () => {
    const { container } = render(<Header />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('flex');
    expect(nav).toHaveClass('justify-between');
    expect(nav).toHaveClass('items-center');
  });

  it('should have proper title styling', () => {
    const { container } = render(<Header />);
    const titleLink = screen.getByRole('link', { name: /Nest-Next Clean Arch/i });
    expect(titleLink).toHaveClass('text-2xl');
    expect(titleLink).toHaveClass('font-extrabold');
  });

  it('should have navigation list', () => {
    const { container } = render(<Header />);
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
  });

  it('should have proper list styling', () => {
    const { container } = render(<Header />);
    const list = container.querySelector('ul');
    expect(list).toHaveClass('flex');
    expect(list).toHaveClass('space-x-6');
  });

  it('should have list items with proper styling', () => {
    const { container } = render(<Header />);
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('should have hover effects on links', () => {
    const { container } = render(<Header />);
    const links = screen.getAllByRole('link');
    
    links.forEach((link) => {
      if (link.textContent?.includes('Home') || link.textContent?.includes('About')) {
        expect(link.className).toContain('hover');
      }
    });
  });

  it('should render all navigation items', () => {
    const { container } = render(<Header />);
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2); // Home and About
  });

  it('should be responsive container', () => {
    const { container } = render(<Header />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('container');
    expect(nav).toHaveClass('mx-auto');
  });

  it('should have proper layout structure', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    const nav = container.querySelector('nav');
    const title = screen.getByRole('link', { name: /Nest-Next Clean Arch/i });
    const list = container.querySelector('ul');

    expect(header).toContainElement(nav!);
    expect(nav).toContainElement(title);
    expect(nav).toContainElement(list!);
  });
});
