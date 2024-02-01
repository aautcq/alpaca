export function useFileSizeFormat(size: number) {
  if (size < 1024)
    return `${size}B`
  const sizeInKB = Math.round(size / 1024)
  if (sizeInKB < 1024)
    return `${sizeInKB}KB`
  const sizeInMB = sizeInKB / 1024
  if (sizeInMB < 1024)
    return `${sizeInMB.toFixed(2)}MB`
  const sizeInGB = sizeInMB / 1024
  return `${sizeInGB.toFixed(2)}GB`
};
