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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      // 800x1000 high-res target dimensions for extreme sharpness and clarity
      const targetWidth = 800;
      const targetHeight = 1000;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

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

      // Draw original image on a temporary canvas to analyze and key out solid background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve(base64Str);
        return;
      }

      // Enable high-quality image smoothing
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

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

      // If the image is already transparent or has transparent elements, skip color keying
      if (!isAlreadyTransparent) {
        const bgR = rSum / 4;
        const bgG = gSum / 4;
        const bgB = bSum / 4;

        // Key out light studio/gray backgrounds or corners
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

      // Draw onto final canvas
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw transparent processed subject layer
      ctx.drawImage(tempCanvas, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      console.error("Image loading failed during processing:", err);
      resolve(base64Str);
    };
  });
}
