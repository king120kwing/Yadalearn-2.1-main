/**
 * Programmatically removes white, off-white, or corner-sampled background colors
 * from a base64 image string, returning a transparent PNG base64 string.
 * Uses a higher 800x1000 resolution for maximum sharpening and clarity.
 */
export function removeImageBackground(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const targetWidth = img.width;
      const targetHeight = img.height;
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      // Draw original image on a temporary canvas to analyze and key out solid background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve(base64Str);
        return;
      }

      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imgData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;

      // Sample corners to check if the image has a solid background
      const corners = [
        [0, 0],
        [targetWidth - 1, 0],
        [0, targetHeight - 1],
        [targetWidth - 1, targetHeight - 1]
      ];

      let rSum = 0, gSum = 0, bSum = 0;
      let isAlreadyTransparent = false;

      corners.forEach(([cx, cy]) => {
        const idx = (cy * targetWidth + cx) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        if (data[idx + 3] < 150) {
          isAlreadyTransparent = true;
        }
      });

      // If the image is already transparent, we skip keying
      if (!isAlreadyTransparent) {
        const bgR = rSum / 4;
        const bgG = gSum / 4;
        const bgB = bSum / 4;

        // Key out the background
        const colorThreshold = 75; 
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          const isNearWhite = r > 215 && g > 215 && b > 215;

          if (dist < colorThreshold || isNearWhite) {
            data[i + 3] = 0; // Set to transparent
          }
        }
        tempCtx.putImageData(imgData, 0, 0);
      }

      // Draw onto final canvas WITH A CLEAN STUDIO BACKGROUND
      // This prevents transparent pixels from becoming black when saving as JPEG
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // Draw a soft pleasant gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, targetHeight);
      gradient.addColorStop(0, '#f1f5f9'); // slate-100
      gradient.addColorStop(1, '#e2e8f0'); // slate-200
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the transparent processed subject layer on top of the gradient
      ctx.drawImage(tempCanvas, 0, 0);

      // Export as a high-quality compressed JPEG (as specified by user)
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = (err) => {
      console.error("Image loading failed during processing:", err);
      resolve(base64Str);
    };
  });
}
