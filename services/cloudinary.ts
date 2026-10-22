import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// @ts-ignore
const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmcls36pv';
// @ts-ignore
const UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ZARHRAH-PIC-DATABASE';

/**
 * Optimizes an image in the browser before upload:
 * - Resizes dimensions exceeding 2048px (luxury 2K quality)
 * - Compresses heavy images (>1.5MB) to high-fidelity JPEG (~350KB-600KB)
 * - Prevents Cloudinary upload rejection or network timeouts on large phone photos
 */
export const optimizeImageBeforeUpload = async (file: File): Promise<File | Blob> => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        return file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const maxDim = 2048;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            } else if (file.size < 1.5 * 1024 * 1024) {
                // If dimensions are <= 2048 and file is already under 1.5MB, use original
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob && blob.size < file.size) {
                        const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(optimizedFile);
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                0.86
            );
        };

        img.onerror = () => resolve(file);
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
};

/**
 * Robust image upload with dual-redundancy:
 * 1. Optimizes file via HTML5 Canvas (2048px max, 86% JPEG).
 * 2. Uploads to Cloudinary unsigned preset.
 * 3. If Cloudinary has DNS/network/preset errors, automatically falls back to Firebase Storage!
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    // 1. Optimize image in-memory
    let fileToUpload: File | Blob = file;
    try {
        fileToUpload = await optimizeImageBeforeUpload(file);
    } catch (e) {
        console.warn("Client-side image compression skipped, uploading original:", e);
    }

    // 2. Primary attempt: Cloudinary
    try {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error("Missing Cloudinary configuration.");
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            return data.secure_url;
        }

        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Cloudinary HTTP ${response.status}`);
    } catch (primaryErr: any) {
        console.warn("Cloudinary upload failed, attempting Firebase Storage fallback...", primaryErr);

        // 3. Resilient Secondary Fallback: Firebase Storage
        try {
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileRef = ref(storage, `banners/${Date.now()}_${safeName}`);
            const snapshot = await uploadBytes(fileRef, fileToUpload);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
        } catch (storageErr: any) {
            console.error("Firebase Storage fallback also failed:", storageErr);
            throw new Error(`Upload Failed: ${primaryErr.message || primaryErr}. (Fallback error: ${storageErr.message})`);
        }
    }
};
