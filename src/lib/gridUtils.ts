/**
 * Grid utilities to ensure product grids always have complete rows.
 * 
 * Standard grid: grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6
 * LCM(3, 4, 6) = 12 → trim to multiples of 12 for perfect rows at all breakpoints.
 */

/** Standard grid class used across all product sections */
export const PRODUCT_GRID_CLASSES = 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3';

/** Minimum products needed to show a section */
export const MIN_PRODUCTS_TO_SHOW = 3;

/**
 * Trims a product array to fill complete rows at every breakpoint.
 * Returns items trimmed to the nearest lower multiple of 12, 
 * with a minimum of 3 items (one mobile row).
 */
export function trimToCompleteRows<T>(items: T[]): T[] {
  if (items.length < MIN_PRODUCTS_TO_SHOW) return [];
  
  // LCM of 3, 4, 6 = 12
  const lcm = 12;
  
  if (items.length >= lcm) {
    const count = Math.floor(items.length / lcm) * lcm;
    return items.slice(0, count);
  }
  
  // If fewer than 12, trim to nearest multiple of 3 (smallest column count)
  const count = Math.floor(items.length / 3) * 3;
  return count >= MIN_PRODUCTS_TO_SHOW ? items.slice(0, count) : [];
}
