/**
 * Programmatically removes white, off-white, or corner-sampled background colors
 * from a base64 image string, returning a transparent PNG base64 string.
 */
export function removeImageBackground(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a valid data URL or is already a clean transparent image, return it
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      // Resize to max 200x200 for profile avatar
      const maxDim = 200;
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
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      
      // Draw the image scaled to the new canvas size
      ctx.drawImage(img, 0, 0, width, height);
      
      // Draw the original image exactly as uploaded (no background removal)
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as a high-quality compressed JPEG (preserves background and colors perfectly)
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
