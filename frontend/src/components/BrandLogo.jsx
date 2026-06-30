/**
 * BrandLogo — shared logo component used across Navbar, Sidebar, Footer,
 * and Admin layouts.  Renders the custom circular Japanese logo image at a
 * consistent size with a 1:1 aspect ratio and Retina-safe rendering.
 *
 * Props:
 *   size  — number (px) for width / height (default 36)
 *   className — extra CSS classes forwarded to the <img> element
 */
const BrandLogo = ({ size = 36, className = "", ...props }) => (
  <img
    src="/logo.png"
    alt="SenpaiMart logo"
    width={size}
    height={size}
    draggable={false}
    className={`shrink-0 select-none object-contain ${className}`}
    style={{ width: size, height: size, aspectRatio: "1 / 1" }}
    {...props}
  />
);

export default BrandLogo;
