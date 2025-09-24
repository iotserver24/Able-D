import { useState, useEffect } from 'react';
import { getSubjectNames } from '@/services/subjectsService';

interface UseSubjectsOptions {
  school: string;
  class: string;
  enabled?: boolean;
}

export const useSubjects = ({ school, class: classValue, enabled = true }: UseSubjectsOptions) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !school || !classValue) {
      setSubjects(['English', 'Science', 'Mathematics', 'History', 'Geography']);
      return;
    }

    const fetchSubjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const subjectNames = await getSubjectNames(school, classValue, token);
          setSubjects(subjectNames);
        } else {
          // Use default subjects when no token available
          setSubjects(['English', 'Science', 'Mathematics', 'History', 'Geography']);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        // Fallback to default subjects
        setSubjects(['English', 'Science', 'Mathematics', 'History', 'Geography']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [school, classValue, enabled]);

  return {
    subjects,
    isLoading,
    error,
    refetch: () => {
      if (enabled && school && classValue) {
        const fetchSubjects = async () => {
          setIsLoading(true);
          setError(null);
          
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const subjectNames = await getSubjectNames(school, classValue, token);
              setSubjects(subjectNames);
            } else {
              setSubjects(['English', 'Science', 'Mathematics', 'History', 'Geography']);
            }
          } catch (err) {
            console.error('Error fetching subjects:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
            setSubjects(['English', 'Science', 'Mathematics', 'History', 'Geography']);
          } finally {
            setIsLoading(false);
          }
        };
        fetchSubjects();
      }
    }
  };
};
