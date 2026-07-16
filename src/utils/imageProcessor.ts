/**
 * Bypasses background removal to prevent image corruption (striping, grey blocks)
 * caused by inconsistent color-keying algorithms on various skin tones and backgrounds.
 */
export function removeImageBackground(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    resolve(base64Str);
  });
}
