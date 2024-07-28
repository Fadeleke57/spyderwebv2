import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

const GoogleCallback: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      localStorage.setItem('token', token as string);
      dispatch(login({ email, name }));
      router.push('/terminal');
    }
  }, [router.query, dispatch, router]);

  return <div>Loading...</div>;
};

export default GoogleCallback;