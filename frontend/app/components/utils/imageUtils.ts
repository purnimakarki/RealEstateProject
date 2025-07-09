
/**
 
 * @param url The raw image URL or IPFS hash
 * @returns Properly formatted URL for display
 */
export const formatImageUrl = (url: string): string => {
  // If the URL is already a complete URL, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's an IPFS hash (without the gateway prefix)
  if (!url.includes('://')) {
    // Remove any 'ipfs://' prefix if present
    const hash = url.replace('ipfs://', '');
    // Return the URL with the IPFS gateway
    return `https://ipfs.io/ipfs/${hash}`;
  }
  
  // Return the URL as is for any other case
  return url;
};