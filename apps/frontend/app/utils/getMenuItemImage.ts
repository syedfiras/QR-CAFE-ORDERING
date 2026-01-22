/**
 * Menu Item Image Helper
 * Resolves the correct image URL for a menu item
 */

// Supabase Storage base URL - uses public bucket
const rawProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';

/**
 * Extract just the project ID from various input formats:
 * - "projectid" -> "projectid"
 * - "https://projectid.supabase.co" -> "projectid"
 * - "projectid.supabase.co" -> "projectid"
 */
function extractProjectId(input: string): string {
  if (!input) return '';
  
  // Remove https:// or http://
  let cleaned = input.replace(/^https?:\/\//, '');
  
  // Remove .supabase.co and anything after
  cleaned = cleaned.replace(/\.supabase\.co.*$/, '');
  
  return cleaned.trim();
}

const SUPABASE_PROJECT_ID = extractProjectId(rawProjectId);

/**
 * Generates the Supabase Storage public URL for an image
 */
export function getSupabaseStorageUrl(bucket: string, path: string): string {
  if (!SUPABASE_PROJECT_ID) {
    console.warn('NEXT_PUBLIC_SUPABASE_PROJECT_ID is not set');
    return '';
  }
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Normalizes a category name for use in file paths
 * - Converts to lowercase
 * - Replaces spaces and special characters with dashes
 * - Removes consecutive dashes
 */
export function normalizeCategoryName(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Menu item type with required fields for image resolution
 */
export interface MenuItemForImage {
  id: string;
  name: string;
  image_url?: string | null;
}

/**
 * Resolves the image URL for a menu item
 * 
 * Only returns the item's image_url if it exists and is valid.
 * Returns null otherwise (component should show placeholder).
 * 
 * @param item - The menu item
 * @param categoryName - Optional, not currently used but kept for future extension
 * @returns The resolved image URL or null if no image available
 */
export function getMenuItemImage(
  item: MenuItemForImage,
  categoryName?: string
): string | null {
  // Only use item's image_url if it exists and is valid
  if (item.image_url && item.image_url.trim() !== '' && !item.image_url.includes('default')) {
    return item.image_url;
  }

  // No image available - component should show placeholder
  // We removed category fallback since it causes 400 errors when images don't exist
  return null;
}

/**
 * Default placeholder for when no image is available
 */
export const DEFAULT_FOOD_EMOJI = '🍽️';


