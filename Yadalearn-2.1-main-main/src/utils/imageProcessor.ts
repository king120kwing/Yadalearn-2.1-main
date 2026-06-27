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
      
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      // Sample the corner pixels to find the background color
      const corners = [
        { r: data[0], g: data[1], b: data[2] }, // Top-Left
        { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] }, // Top-Right
        { r: data[(height - 1) * width * 4], g: data[(height - 1) * width * 4 + 1], b: data[(height - 1) * width * 4 + 2] }, // Bottom-Left
        { r: data[((height - 1) * width + width - 1) * 4], g: data[((height - 1) * width + width - 1) * 4 + 1], b: data[((height - 1) * width + width - 1) * 4 + 2] } // Bottom-Right
      ];

      const colorBins: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
      let bgR = 255;
      let bgG = 255;
      let bgB = 255;
      let maxCount = 0;

      corners.forEach(c => {
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

      // BFS flood fill starting from all border pixels
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];
      
      const isBgColor = (r: number, g: number, b: number) => {
        // If it's near-white (general background)
        if (r > 240 && g > 240 && b > 240) return true;
        // Check distance to corner background color
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        return dist < 50; // 50 is a solid threshold to capture solid backgrounds and gradients
      };

      // Initialize queue with all border pixels
      for (let x = 0; x < width; x++) {
        // Top border
        queue.push(x, 0);
        visited[x] = 1;
        // Bottom border
        const idxBottom = (height - 1) * width + x;
        queue.push(x, height - 1);
        visited[idxBottom] = 1;
      }
      for (let y = 1; y < height - 1; y++) {
        // Left border
        const idxLeft = y * width;
        queue.push(0, y);
        visited[idxLeft] = 1;
        // Right border
        const idxRight = y * width + (width - 1);
        queue.push(width - 1, y);
        visited[idxRight] = 1;
      }

      let qHead = 0;
      while (qHead < queue.length) {
        const x = queue[qHead++];
        const y = queue[qHead++];
        
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (isBgColor(r, g, b)) {
          data[idx + 3] = 0; // make transparent
          
          // Enqueue unvisited neighbors
          const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
