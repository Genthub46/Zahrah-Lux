
/**
 * Optimizes Cloudinary URLs by adding f_auto,q_auto transformations.
 * This ensures the browser receives the best format (WebP/AVIF) and optimal quality.
 * @param url The original image URL
 * @returns The optimized URL
 */
export const getOptimizedImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('/f_auto,q_auto/')) {
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return url;
};
