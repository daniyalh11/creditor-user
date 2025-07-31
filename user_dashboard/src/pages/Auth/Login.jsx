import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, BookOpen, Users, Award } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchUserProfile, setUserRole, setUserRoles } from "@/services/userService";
import logoCreditor from "@/assets/logo_creditor.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [animateCard, setAnimateCard] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Trigger card animation on mount
    setAnimateCard(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login with:", { email, API_BASE });
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      console.log('Login response from backend:', response.data);

      if (response.data.success && response.data.token) {
        // Store token in cookies for 7 days
        Cookies.set("token", response.data.token, { 
          expires: 7,
          secure: true,
          sameSite: 'strict'
        });
        
        // Set default role first
        setUserRole('user');
        
        // Fetch user profile and set single user role in localStorage
        try {
          const profile = await fetchUserProfile();
          console.log('Fetched user profile after login:', profile);
          if (profile && Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
            // Extract role names and use the highest priority role (admin > instructor > user)
            const roles = profile.user_roles.map(roleObj => roleObj.role);
            const priorityRoles = ['admin', 'instructor', 'user'];
            const highestRole = priorityRoles.find(role => roles.includes(role)) || 'user';
            
            // Set single role (enforces single role system)
            setUserRoles([highestRole]);
            console.log('Set user single role to:', highestRole);
          } else {
            // If no roles found, set default user role
            setUserRoles(['user']);
          }
        } catch (profileErr) {
          console.warn("Could not fetch user profile:", profileErr);
          // Keep default 'user' role
          setUserRoles(['user']);
        }
        
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        const errorMessage = err.response.data?.message || "Login failed";
        toast.error(errorMessage);
        console.error("Server error details:", err.response.data);
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
        console.error("Network error details:", err.request);
      } else {
        toast.error("An unexpected error occurred.");
        console.error("Other error details:", err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/"); // Navigate directly to homepage
  };

  const features = [
    { icon: <BookOpen className="h-5 w-5" />, text: "Expert-Led Courses" },
    { icon: <Users className="h-5 w-5" />, text: "Professional Network" },
    { icon: <Award className="h-5 w-5" />, text: "Industry Recognition" }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 relative overflow-hidden">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBackClick} 
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Button>
      </div>

      {/* Enhanced background elements with blue shades */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/25 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-sky-300/15 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center p-4 lg:p-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-start justify-center h-full text-slate-800 p-8">
          {/* Logo and Brand */}
          <div className={`transform transition-all duration-1000 ${animateCard ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-200/50">
                <img src={logoCreditor} alt="Creditor Academy" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Creditor Academy
                </h1>
                <p className="text-slate-600 text-lg">Premier Legal Education Platform</p>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className={`transform transition-all duration-1000 delay-300 ${animateCard ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <h2 className="text-4xl font-bold mb-6 leading-tight text-slate-800">
              Master the Art of
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Legal Excellence
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Join thousands of legal professionals who have transformed their careers through our comprehensive, expert-led courses.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className={`grid grid-cols-1 gap-4 w-full transform transition-all duration-1000 delay-500 ${animateCard ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-4 lg:p-8">
          <Card className={`w-full max-w-md bg-white/95 backdrop-blur-sm border border-blue-100/50 shadow-2xl transform transition-all duration-1000 ${animateCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
            <CardHeader className="space-y-4 text-center pb-6">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center gap-3 lg:hidden mb-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-blue-200/50">
                  <img src={logoCreditor} alt="Creditor Academy" className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Creditor Academy</h2>
                  <p className="text-xs text-slate-600">Legal Education Platform</p>
                </div>
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</CardTitle>
                <CardDescription className="text-slate-600">
                  Sign in to continue your legal education journey
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                      disabled={isLoading}
                      required
                      className={`h-11 px-4 border-2 transition-all duration-300 ${
                        isFocused.email 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-slate-200 hover:border-blue-300'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      disabled={isLoading}
                      required
                      className={`h-11 px-4 pr-12 border-2 transition-all duration-300 ${
                        isFocused.password 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-slate-200 hover:border-blue-300'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pt-4">
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-slate-600 font-medium">256-bit SSL Encryption</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;