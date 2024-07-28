import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/register', {
        username,
        email,
        password,
      });
      if (response.status === 200) {
        console.log('Registration successful');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8000/auth/login';
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <button type="submit">Register</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign up with Google</button>
    </div>
  );
};

export default Register;