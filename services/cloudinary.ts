// @ts-ignore
const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmcls36pv';
// @ts-ignore
const UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ZARHRAH-PIC-DATABASE';

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Missing Cloudinary configuration. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    // Optional: Add folder organization if needed, but preset usually handles it.
    // formData.append('folder', 'zahrah_products'); 

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary Upload Failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
};
