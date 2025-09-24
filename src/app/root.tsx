import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useAsyncError,
  useLocation,
  useRouteError,
} from 'react-router';

import { useButton } from '@react-aria/button';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FC,
  Component,
} from 'react';
import './global.css';

import { useNavigate } from 'react-router';
import { serializeError } from 'serialize-error';
import { Toaster } from 'sonner';
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import '@/utils/firebase';
import type { Route } from './+types/root';

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
      setErrorBoundaryError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;

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
  return <Outlet />;
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