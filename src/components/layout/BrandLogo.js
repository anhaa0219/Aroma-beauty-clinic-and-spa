import Image from 'next/image';

// /public/aroma.jpg is 1024×636 with the logo inside a white margin.
// Crop to the logo (measured box x 172–876, y 64–541, incl. a little padding).
const CROP = {
  aspectRatio: '704 / 477',
  img: { width: '145.45%', height: '133.33%', left: '-24.43%', top: '-13.42%', maxWidth: 'none' },
};

/**
 * The Aroma logo from aroma.jpg, blended into the background so its white box disappears.
 * - variant "light": for light backgrounds — multiply turns the white transparent.
 * - variant "dark":  for dark backgrounds — invert + hue-rotate flips light/dark but keeps
 *   the pink/purple hues, then screen makes the (now black) background transparent.
 */
export default function BrandLogo({ variant = 'light', className = '', priority = false }) {
  const blend =
    variant === 'dark'
      ? 'invert hue-rotate-180 saturate-150 brightness-110 mix-blend-screen'
      : 'mix-blend-multiply';

  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ aspectRatio: CROP.aspectRatio }}>
      <Image
        src="/aroma.jpg"
        alt="Aroma Beauty Clinic & Spa"
        width={1024}
        height={636}
        priority={priority}
        className={`absolute ${blend}`}
        style={CROP.img}
      />
    </span>
  );
}
