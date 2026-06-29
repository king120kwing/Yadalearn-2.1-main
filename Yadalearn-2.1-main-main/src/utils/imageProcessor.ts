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
      // Calculate target dimensions maintaining a 4:5 aspect ratio for portrait card
      const targetWidth = 400;
      const targetHeight = 500;
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      // Draw the original image centered and cropped to cover the 4:5 aspect ratio
      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
      
      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }

      // 1. Create a blurred, semi-transparent background layer (Layer 1)
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = targetWidth;
      bgCanvas.height = targetHeight;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        if (bgCtx.filter !== undefined) {
          bgCtx.filter = 'blur(20px)';
        }
        bgCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      }

      // 2. Create a sharp center subject layer with a smooth radial mask (Layer 2)
      const sharpCanvas = document.createElement('canvas');
      sharpCanvas.width = targetWidth;
      sharpCanvas.height = targetHeight;
      const sharpCtx = sharpCanvas.getContext('2d');
      if (sharpCtx) {
        // Create radial gradient mask offset slightly upward toward the face
        const grad = sharpCtx.createRadialGradient(
          targetWidth / 2, 
          targetHeight / 2 - 20, 
          0, 
          targetWidth / 2, 
          targetHeight / 2 - 20, 
          targetHeight * 0.55
        );
        grad.addColorStop(0.0, 'rgba(0, 0, 0, 1.0)');   // Center is fully opaque
        grad.addColorStop(0.45, 'rgba(0, 0, 0, 1.0)');  // Main subject is fully opaque
        grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.0)');  // Edges fade smoothly to transparent
        
        sharpCtx.fillStyle = grad;
        sharpCtx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Draw the sharp image masked in
        sharpCtx.globalCompositeOperation = 'source-in';
        sharpCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      }

      // 3. Composite layers on the main canvas
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // Draw blurred background with 45% opacity
      ctx.globalAlpha = 0.45;
      ctx.drawImage(bgCanvas, 0, 0, targetWidth, targetHeight);
      
      // Draw sharp masked center with 100% opacity
      ctx.globalAlpha = 1.0;
      ctx.drawImage(sharpCanvas, 0, 0, targetWidth, targetHeight);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      console.error("Image loading failed during processing:", err);
      resolve(base64Str);
    };
  });
}
