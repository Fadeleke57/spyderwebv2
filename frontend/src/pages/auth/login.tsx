import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
 
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { googleIcon } from '@/components/utility/Icons';


const Login = () => {
  const router = useRouter();
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
    <div className="w-full flex items-center justify-center h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className='font-bold mb-2'>Login to Spydr</CardTitle>
          <CardDescription>Enter your email and password below to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type='email' placeholder="johndoe@example.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type='password' placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/>
              </div>
              <Button type="submit" onClick={handleSubmit}>Login</Button>
              <div className='flex flex-row items-center'>
                <div className='flex-grow'><Separator /></div><div className='px-2'><small className="text-sm font-medium leading-none text-muted-foreground">OR CONTINUE WITH GOOGLE</small></div><div className='flex-grow'><Separator /></div>
              </div>
              <Button variant="outline" onClick={handleGoogleSignIn}>{googleIcon}<span className='ml-2'>Login with Google</span></Button>
              <p>Don&apos;t have an account? <Link href="/auth/register" className="text-blue-500">Register</Link></p>              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;