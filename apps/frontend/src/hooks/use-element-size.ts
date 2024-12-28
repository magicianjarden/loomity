import { useCallback, useEffect, useState } from 'react';

export function useElementSize(elementRef: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (elementRef.current) {
      const { width, height } = elementRef.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, [elementRef]);

  useEffect(() => {
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [elementRef, updateSize]);

  return size;
}
