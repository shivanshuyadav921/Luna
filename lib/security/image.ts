/**
 * Image EXIF & Metadata Stripper
 * Draws uploaded file onto a clean HTML Canvas context and exports a fresh Blob
 * to guarantee that all camera, GPS location, timestamp, and device EXIF metadata are completely erased.
 */

export async function stripExifAndProcessImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.88
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Basic file validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Uploaded file is not a valid image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate dynamic dimensions preserving aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create clean canvas context
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to create 2D canvas context.'));
        }

        // Draw image onto canvas - strips all headers and EXIF data
        ctx.drawImage(img, 0, 0, width, height);

        // Export as clean Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate sanitized image blob.'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for sanitization.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
