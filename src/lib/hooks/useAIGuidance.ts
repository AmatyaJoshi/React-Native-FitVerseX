import { useState, useCallback } from 'react';

interface UseAIGuidanceReturn {
  guidance: string;
  loading: boolean;
  error: string | null;
  generateGuidance: (prompt: string, exerciseData?: Record<string, any>) => Promise<void>;
}

export function useAIGuidance(): UseAIGuidanceReturn {
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGuidance = useCallback(
    async (prompt: string, exerciseData?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      setGuidance('');

      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            exerciseData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate guidance');
        }

        const data = await response.json();
        setGuidance(data.guidance);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('AI Guidance Error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    guidance,
    loading,
    error,
    generateGuidance,
  };
}
