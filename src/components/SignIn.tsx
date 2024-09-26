import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import Loader from "@/utils/Loader";
import { Link, useNavigate } from 'react-router-dom'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const[email , setEmail] = useState("");
  const[password , setPassword] = useState("");
  const[loading , setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignIn() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/user/signin",{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify({
          email,
          password
        })
      });

      if(response.ok){
        setEmail("");
        setPassword("");
        setLoading(false);
        navigate("/");
      }

    } catch (error) {
      console.log("Unable to signin user");
      
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
        {loading ? (
            <Button
              className="w-full h-12 flex items-center justify-center"
              onClick={handleSignIn}>
              <Loader />
            </Button>
          ) : (
            <Button
              className="w-full h-12"
              onClick={handleSignIn}>
              Sign Up
            </Button>
          )}
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Link className="text-primary hover:underline" to={"/sign-up"}>
              Sign u
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
