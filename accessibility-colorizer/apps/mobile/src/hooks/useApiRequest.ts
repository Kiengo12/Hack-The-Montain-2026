import { useCallback, useState } from 'react';

export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiRequest<T>() {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
