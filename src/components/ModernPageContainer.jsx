/**
 * Modern Page Container with Glassmorphism Design
 * Reusable component for consistent modern styling across all pages
 */

export default function ModernPageContainer({ 
  children, 
  title, 
  subtitle,
  maxWidth = "7xl",
  showBackground = true 
}) {
  return (
    <div className={`w-full ${showBackground ? 'py-12' : 'py-8'}`}>
      {showBackground && (
        /* Background decorative elements */
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      )}
      
      <div className={`max-w-${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}>
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}

