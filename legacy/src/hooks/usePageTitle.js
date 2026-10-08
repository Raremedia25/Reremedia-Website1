import { useEffect } from 'react';

const BASE = 'RAREMEDIA';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} — We Build Smart Digital Solutions for Your Business`;
  }, [title]);
}
