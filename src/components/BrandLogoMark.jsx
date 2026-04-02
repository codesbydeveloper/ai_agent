/** App logo — `public/voice-recognition_13320489.png`; pair with `authLogoTileClass` on auth screens. */
const LOGO_SRC = '/voice-recognition_13320489.png';

export function BrandLogoIcon({ className = 'h-10 w-10' }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      className={`object-contain ${className}`}
      decoding="async"
      draggable={false}
      aria-hidden
    />
  );
}
