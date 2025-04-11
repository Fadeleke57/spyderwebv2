import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useResourceUsage() {
  return useQuery({
    queryKey: ['resourceUsage'],
    queryFn: async () => {
      const response = await api.get('/users/usage');
      return response.data;
    },
  });
}

