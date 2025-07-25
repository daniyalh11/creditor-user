import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchUserProfile } from "@/services/userService";
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://sharebackend-9g3y.onrender.com/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}api/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        // localStorage.setItem("token", response.data.token);
        Cookies.set("token", response.data.token, { expires: 7 }); // Store token in cookies for 7 days
        // Fetch user profile and set userRole in localStorage
        try {
          const profile = await fetchUserProfile();
          if (Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
            localStorage.setItem('userRole', profile.user_roles[0].role);
          } else {
            localStorage.setItem('userRole', 'user');
          }
        } catch (profileErr) {
          localStorage.setItem('userRole', 'user');
        }
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center p-8">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gavel className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold text-primary">Creditor Academy</h1>
            </div>
            <p className="text-xl text-muted-foreground">Your premier platform for legal education</p>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=1000" 
              alt="Law Library" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Comprehensive Legal Education</h2>
              <p className="text-gray-200">Access courses taught by legal professionals and scholars</p>
            </div>
          </div>
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 md:hidden mb-2">
              <Gavel className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Creditor Academy</h2>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              {/* Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/signup")}>
                Sign up
              </Button> */}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login;