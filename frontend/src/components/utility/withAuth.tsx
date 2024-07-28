import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';

type WrappedComponentProps = {
  [key: string]: any;
};

const withAuth = <P extends WrappedComponentProps>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  const AuthHOC: React.FC<P> = (props) => {
    const router = useRouter();
    const auth = useSelector(selectAuth);

    useEffect(() => {
      console.log('Checking auth state:', auth);
      if (!auth.isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/auth/login');
      }
    }, [auth, router]);

    return auth.isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return AuthHOC;
};

export default withAuth;