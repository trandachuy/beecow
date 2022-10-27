import { useCallback, useEffect } from "react";

export default function useDebounceEffect(effect = () => void 0, delay = 100, deps = []) {
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
  }, [callback, delay]);

}
