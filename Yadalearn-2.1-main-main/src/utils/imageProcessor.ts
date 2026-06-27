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
      
      // Sample the top-left and top-right corner pixels to find the background color
      const corners = [
        { r: data[0], g: data[1], b: data[2] }, // Top-Left
        { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] } // Top-Right
      ];

      // Average the corner colors
      const bgR = Math.round((corners[0].r + corners[1].r) / 2);
      const bgG = Math.round((corners[0].g + corners[1].g) / 2);
      const bgB = Math.round((corners[0].b + corners[1].b) / 2);

      // BFS flood fill starting ONLY from the top edge and top 30% of side borders
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];
      
      const isBgColor = (r: number, g: number, b: number) => {
        // If it's near-white (general background)
        if (r > 235 && g > 235 && b > 235) return true;
        // Check distance to corner background color
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        return dist < 48; // 48 is a balanced threshold for compression gradients
      };

      // Initialize queue with top edge
      for (let x = 0; x < width; x++) {
        queue.push(x, 0);
        visited[x] = 1;
      }
      // Initialize queue with top 30% of left and right edges
      const sideLimit = Math.floor(height * 0.3);
      for (let y = 1; y < sideLimit; y++) {
        // Left edge
        const idxLeft = y * width;
        queue.push(0, y);
        visited[idxLeft] = 1;
        // Right edge
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

      // Edge feathering pass to prevent pixelated/jagged edges
      const tempAlpha = new Uint8Array(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > 0) {
            // Check 4-neighbors opacity
            const n1 = data[(y * width + (x + 1)) * 4 + 3];
            const n2 = data[(y * width + (x - 1)) * 4 + 3];
            const n3 = data[((y + 1) * width + x) * 4 + 3];
            const n4 = data[((y - 1) * width + x) * 4 + 3];
            
            if (n1 === 0 || n2 === 0 || n3 === 0 || n4 === 0) {
              tempAlpha[y * width + x] = 110; // 43% opacity for soft boundary
            } else {
              tempAlpha[y * width + x] = 255;
            }
          }
        }
      }
      
      // Apply smoothed alpha values back to pixels
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const nIdx = y * width + x;
          const idx = nIdx * 4;
          if (data[idx + 3] > 0) {
            data[idx + 3] = tempAlpha[nIdx];
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
