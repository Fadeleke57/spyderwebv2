import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { login } from '../../store/slices/authSlice';

const GoogleCallback: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      router.push('/terminal');
    }
  }, [router.query, router]);

  return <div>Loading...</div>;
};

export default GoogleCallback;