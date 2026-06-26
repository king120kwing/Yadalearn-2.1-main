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
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Sample the corner pixels
      const corners = [
        { r: data[0], g: data[1], b: data[2] }, // Top-Left
        { r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2] }, // Top-Right
        { r: data[(canvas.height - 1) * canvas.width * 4], g: data[(canvas.height - 1) * canvas.width * 4 + 1], b: data[(canvas.height - 1) * canvas.width * 4 + 2] }, // Bottom-Left
        { r: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4], g: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 1], b: data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 2] } // Bottom-Right
      ];

      // Find the most common corner color
      const colorBins: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
      let bgR = 255;
      let bgG = 255;
      let bgB = 255;
      let maxCount = 0;

      corners.forEach(c => {
        // Group similar colors by rounding components to nearest 15
        const rBin = Math.round(c.r / 15) * 15;
        const gBin = Math.round(c.g / 15) * 15;
        const bBin = Math.round(c.b / 15) * 15;
        const key = `${rBin},${gBin},${bBin}`;
        
        if (!colorBins[key]) {
          colorBins[key] = { r: c.r, g: c.g, b: c.b, count: 0 };
        }
        colorBins[key].count++;
        
        if (colorBins[key].count > maxCount) {
          maxCount = colorBins[key].count;
          bgR = colorBins[key].r;
          bgG = colorBins[key].g;
          bgB = colorBins[key].b;
        }
      });

      // Tolerance checks: transparent if pixel is near-white OR close to corner bg color
      const isBackground = (r: number, g: number, b: number) => {
        // If it's near-white
        if (r > 238 && g > 238 && b > 238) {
          return true;
        }
        // If it is close to the corner sampled background color
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        return dist < 38; // 38 is a solid threshold for compression artifacts
      };

      // Loop through all pixels and make background pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isBackground(r, g, b)) {
          data[i + 3] = 0; // alpha = 0
        }
      }
      
      // Write modified pixel data back to canvas
      ctx.putImageData(imgData, 0, 0);
      
      // Export as transparent PNG
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
