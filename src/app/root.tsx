import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useAsyncError,
  useRouteError,
  useLocation,
} from 'react-router';

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import './global.css';

import { Toaster } from 'sonner';
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import '@/utils/firebase';
// @ts-ignore
import Header from '@/components/landing/Header';
// @ts-ignore
import Footer from '@/components/landing/Footer';

export const links = () => [];

function SharedErrorBoundary({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: ReactNode;
}): React.ReactElement {
  const error = useAsyncError();
  const routeError = useRouteError();
  const [errorBoundaryError, setErrorBoundaryError] = useState<Error | null>(null);

  const displayError = error || routeError || errorBoundaryError;

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore AbortError as it's often not critical
      if (event.error?.name === 'AbortError') {
        console.warn('AbortError caught and ignored:', event.error);
        return;
      }
      setErrorBoundaryError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore AbortError as it's often not critical
      if (event.reason?.name === 'AbortError') {
        console.warn('AbortError promise rejection caught and ignored:', event.reason);
        return;
      }
      setErrorBoundaryError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (displayError) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Error</title>
        </head>
        <body>
          <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Something went wrong</h1>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error details</summary>
              {displayError instanceof Error ? displayError.message : String(displayError)}
            </details>
          </div>
        </body>
      </html>
    );
  }

  return <>{children}</>;
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <LoadFonts />
      </head>
      <body>
        <SharedErrorBoundary isOpen={false}>
          {children}
        </SharedErrorBoundary>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  
  // Pages that should not have header/footer (full-screen experiences)
  const noLayoutPages = [
    '/session/', // Session rooms are full-screen
    '/admin/login', // Admin login should be standalone
  ];
  
  const shouldHideLayout = noLayoutPages.some(path => location.pathname.includes(path));
  
  if (shouldHideLayout) {
    return <Outlet />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50">
      <Header />
      <main className="min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function HydrateFallback() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Loading...</title>
      </head>
      <body>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div>Loading...</div>
        </div>
      </body>
    </html>
  );
}