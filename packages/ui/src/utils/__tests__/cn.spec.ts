import { cn } from '../cn';

describe('cn utility', () => {
  it('should merge simple class names', () => {
    const result = cn('px-2', 'py-2');
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
  });

  it('should handle conditional classes', () => {
    const result = cn('px-2', true && 'py-2', false && 'hidden');
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
    expect(result).not.toContain('hidden');
  });

  it('should merge Tailwind conflicting classes', () => {
    const result = cn('px-2', 'px-4');
    // twMerge should keep the last conflicting class
    expect(result).toContain('px-4');
  });

  it('should handle undefined and null values', () => {
    const result = cn('px-2', undefined, null, 'py-2');
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
  });

  it('should handle empty strings', () => {
    const result = cn('px-2', '', 'py-2');
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['px-2', 'py-2'], ['mt-2']);
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
    expect(result).toContain('mt-2');
  });

  it('should handle objects for conditional classes', () => {
    const result = cn({
      'px-2': true,
      'py-2': true,
      'hidden': false,
    });
    expect(result).toContain('px-2');
    expect(result).toContain('py-2');
    expect(result).not.toContain('hidden');
  });

  it('should return valid class string', () => {
    const result = cn('px-2', 'py-2', 'bg-blue-500');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle complex combinations', () => {
    const result = cn(
      'inline-flex items-center justify-center',
      'h-10 px-4 py-2',
      true && 'bg-blue-600',
      false && 'bg-red-600',
      { 'text-white': true, 'text-black': false }
    );
    expect(result).toContain('inline-flex');
    expect(result).toContain('h-10');
    expect(result).toContain('bg-blue-600');
    expect(result).not.toContain('bg-red-600');
  });
});
