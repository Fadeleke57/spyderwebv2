import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/auth/token',
        new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (response.status === 200) {
        console.log('Login successful');
        dispatch(login(response.data.user)); 
        localStorage.setItem('token', response.data.access_token);
        router.push('/terminal');
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8000/auth/login/google';
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
};

export default Login;