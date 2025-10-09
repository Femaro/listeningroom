/**
 * Modern Card Component with Glassmorphism
 * Reusable card with modern styling and hover effects
 */

export default function ModernCard({ 
  children, 
  className = "",
  hover = true,
  padding = "p-6",
  gradient = false 
}) {
  const hoverClass = hover ? "hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300" : "";
  const baseClass = "bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50";
  const gradientClass = gradient ? "bg-gradient-to-br from-white/95 to-teal-50/90" : "";
  
  return (
    <div className={`${baseClass} ${gradientClass} ${padding} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

