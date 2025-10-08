import { useEffect } from 'react';
import { mountVercelToolbar } from '@vercel/toolbar';

export function AppToolbar() {
  useEffect(() => {
    // Mount the Vercel Toolbar when component mounts
    // Since you want the toolbar to show in any deployments,
    // we'll always mount it. You can add conditions here later if needed.
    mountVercelToolbar();
  }, []);

  // This component doesn't render anything visible
  return null;
}
