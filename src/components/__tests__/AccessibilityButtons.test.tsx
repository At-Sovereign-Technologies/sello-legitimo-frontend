import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccessibilityButtons from '../AccesibilityButtons';

describe('AccessibilityButtons', () => {
  it('renders the three accessibility controls', () => {
    const { container } = render(<AccessibilityButtons />);

    expect(container.querySelectorAll('button')).toHaveLength(3);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
