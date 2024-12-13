import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import Loader from "@/utils/Loader";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignUp() {
    try {
      setLoading(true);
      const response = await fetch("https://minimalisticbackend.onrender.com/api/v1/user/signup", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      if (response.ok) {
        setFullName("");
        setEmail("");
        setPassword("");
        setLoading(false);
        navigate("/sign-in");
      }
    } catch (error) {
      setLoading(false);
      console.log(`unable to signup user`);
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return "bg-gray-200";
    if (password.length < 6) return "bg-red-500";
    if (password.length < 10) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center justify-center mb-4">
            <svg
              className="w-16 h-16 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2 className="mt-2 text-xl font-semibold text-primary">
              Minimalistic
            </h2>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to sign up for MinimalisticNote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
              <div
                className={`h-full rounded-full ${getPasswordStrength(
                  password
                )} transition-all duration-300`}
                style={{
                  width: `${Math.min(100, (password.length / 12) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isChecked}
              onCheckedChange={() => setIsChecked(!isChecked)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                terms of service
              </a>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {loading ? (
            <Button
              className="w-full h-12 flex items-center justify-center"
              disabled={!isChecked}
              onClick={handleSignUp}
            >
              <Loader />
            </Button>
          ) : (
            <Button
              className="w-full h-12"
              disabled={!isChecked}
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          )}
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link className="text-primary hover:underline" to={"/sign-in"}>
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
