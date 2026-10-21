import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function useSEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    // Set standard document title
    document.title = `${title} | Zahrah Luxury`;
    
    // Helper to set meta tags dynamically
    const setMeta = (name: string, content: string, property = false) => {
      let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (property) meta.setAttribute('property', name);
        else meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard SEO
    setMeta('description', description);
    
    // Open Graph / Facebook
    setMeta('og:type', 'website', true);
    setMeta('og:title', `${title} | Zahrah Luxury`, true);
    setMeta('og:description', description, true);
    
    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | Zahrah Luxury`);
    setMeta('twitter:description', description);
    
    // Dynamic Image
    if (image) {
      setMeta('og:image', image, true);
      setMeta('twitter:image', image);
    }
    
    // Dynamic URL
    if (url) {
      setMeta('og:url', url, true);
    } else {
      setMeta('og:url', window.location.href, true);
    }
    
  }, [title, description, image, url]);
}
