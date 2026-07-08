import { NODE_COLORS } from '../types/index.ts';

/**
 * Maps the DEFAULT node color to a CSS variable so it adapts to theme.
 * All other node colors (GREEN, RED, YELLOW, BLUE, PURPLE) are vivid enough
 * for both themes and pass through unchanged.
 */
export function resolveNodeColor(color: string): string {
  return color === NODE_COLORS.DEFAULT ? 'var(--color-node-default)' : color;
}
