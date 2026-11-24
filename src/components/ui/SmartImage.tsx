import Image, { type ImageProps } from 'next/image';

const OPTIMIZABLE_HOSTS = ['images.unsplash.com', 'res.cloudinary.com'];

function canOptimize(src: string) {
  if (src.startsWith('/')) return true;
  try {
    return OPTIMIZABLE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * next/image wrapper: optimises local + allow-listed hosts, and falls back to
 * an unoptimised <img> for any other URL an admin pastes in.
 */
export function SmartImage({ src, alt, ...rest }: Omit<ImageProps, 'src'> & { src: string | null | undefined }) {
  const finalSrc = src || '/images/placeholder.svg';
  return <Image src={finalSrc} alt={alt} unoptimized={!canOptimize(finalSrc)} {...rest} />;
}
