"use client";

import type React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, Clock, AlertCircle, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { toast } from "sonner";

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Nigeria", "Ghana", "South Africa",
  "United States", "United Kingdom", "Canada", "Australia", "India", "Germany",
  "France", "Brazil", "Mexico", "Japan", "China", "South Korea", "Singapore",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Morocco", "Other"
];

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accountType, setAccountType] = useState<"standard" | "demo" | "deriv">(
    (searchParams.get("type") as "standard" | "demo" | "deriv") || "standard"
  );

  const referralCode = searchParams.get("ref") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phone: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isRealAccount = accountType === "standard";
  const isDemoAccount = accountType === "demo";
  const isDerivAccount = accountType === "deriv";

  const accountLabel = isDerivAccount 
    ? "Deriv Account" 
    : isRealAccount 
    ? "Real Account" 
    : "Demo Account";

  const accountDescription = isDerivAccount
    ? "Coming soon - Trade synthetic indices & more"
    : isRealAccount
    ? "Trade with real money • KYC required for withdrawals"
    : "Practice trading with $10,000 virtual balance";

  const iconPath = isDerivAccount 
    ? "/deriv-account-icon.png" 
    : isRealAccount 
    ? "/real-account-icon.png" 
    : "/demo-account-icon.png";

  useEffect(() => {
    const typeFromUrl = searchParams.get("type") as "standard" | "demo" | "deriv" | null;
    if (typeFromUrl) setAccountType(typeFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (showOtpScreen && secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else if (secondsLeft === 0) {
      setCanResend(true);
    }
  }, [showOtpScreen, secondsLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password || !formData.username || !formData.country) {
      toast.error("Please fill in all required fields including country");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }
    if (formData.username.includes(" ") || formData.username.trim().split(/\s+/).length > 1) {
      toast.error("Username should only be 1 unique name (no spaces)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        account_type: accountType,
        referral_code: referralCode,
      });

      if (response.error) {
        toast.error(response.error);
        setIsLoading(false);
        return;
      }

      const otpRes = await api.resendEmailOtp(formData.email);
      if (otpRes.error) {
        toast.error("Account created but failed to send verification code.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Check your email for the OTP.");
      setShowOtpScreen(true);
      setSecondsLeft(60);
      setCanResend(false);
    } catch (err) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyEmailOtp({ email: formData.email, otp: code });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Email verified successfully!");

      if (isRealAccount) {
        toast.info(
          "KYC Required: Please submit your Proof of Identity to unlock withdrawals.",
          { duration: 8000 }
        );
      }

      router.push("/dashboard");
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.resendEmailOtp(formData.email);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(60);
      setCanResend(false);
      toast.success("New OTP sent!");
    } catch {
      toast.error("Resend failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
           style={{ backgroundImage: "url('/background.jpg')" }}>
        <div className="absolute inset-0 bg-slate-950/80 z-0" />
        
        <Card className="w-full max-w-md border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl relative z-10 shadow-2xl shadow-cyan-500/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-white/70">
              We sent a 6-digit code to <br />
              <span className="font-medium text-cyan-400">{formData.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-cyan-500/30 text-white focus:border-cyan-400"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              onClick={verifyOtp}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6"
              disabled={isLoading}
            >
              {isLoading ? "Verifying…" : "Verify & Continue"}
            </Button>

            <div className="text-center space-y-1">
              <p className="text-sm text-white/70">
                {canResend ? (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="font-medium text-cyan-400 hover:underline"
                    disabled={isLoading}
                  >
                    Resend code
                  </button>
                ) : (
                  <>Resend available in {secondsLeft}s</>
                )}
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setShowOtpScreen(false);
                setOtp(["", "", "", "", "", ""]);
              }}
              className="w-full text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign-up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-950/80 z-0" />

      <Card className="w-full max-w-md border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl relative z-10 shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-2">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-white/70">{accountDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            {(["standard", "demo", "deriv"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  accountType === type
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {type === "standard" ? "Real" : type === "demo" ? "Demo" : "Deriv"}
              </button>
            ))}
          </div>

          {isRealAccount && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-amber-200 text-xs">
                <strong>Real Account:</strong> KYC (Proof of Identity) is required to enable withdrawals.
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Image
                  src={iconPath}
                  alt={accountLabel}
                  width={64}
                  height={64}
                  className="w-12 h-12 object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{accountLabel}</h3>
              <p className="text-sm text-white/70">{accountDescription}</p>
            </div>
          </div>

          {isDerivAccount ? (
            <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <Clock className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Deriv Account</h3>
              <p className="text-white/70 mb-6">
                Deriv registration is coming soon.<br />
                We are working hard to bring you seamless integration.
              </p>
              <Button
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Username</label>
                <Input
                  type="text"
                  name="username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+254 700 000000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  disabled={isLoading}
                  required
                >
                  <option value="" className="bg-slate-900">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 focus:border-cyan-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 focus:border-cyan-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 shadow-lg shadow-cyan-500/25"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account…" : "Create Account"}
              </Button>

              <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <Link 
                  href={`/login?type=${accountType}`} 
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
