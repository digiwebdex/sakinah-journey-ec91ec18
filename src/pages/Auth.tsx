import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { Eye, EyeOff, Phone, Mail, Shield, CheckCircle2, XCircle } from "lucide-react";

type AuthMode = "login" | "register" | "otp" | "forgot";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "Special character (!@#$...)", test: (p: string) => /[!@#$%^&*(),.?\":{}|<>]/.test(p) },
];

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // OTP fields
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Forgot password
  const [resetEmail, setResetEmail] = useState("");

  const inputClass =
    "w-full bg-secondary border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  const isPasswordStrong = passwordRules.every((r) => r.test(password));

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      // Check role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      toast.success("Welcome back!");
      navigate(roleData ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      toast.error("Please meet all password requirements");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      toast.success("Account created! Please check your email to verify.");
      setMode("login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const cleaned = otpPhone.trim().replace(/[^\d+]/g, "");
    if (cleaned.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("send-otp", {
        body: { phone: cleaned, action: "send" },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("OTP sent to your phone!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const cleaned = otpPhone.trim().replace(/[^\d+]/g, "");
      const res = await supabase.functions.invoke("send-otp", {
        body: { phone: cleaned, action: "verify", code: otpCode },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      // Set session from tokens
      if (res.data?.access_token && res.data?.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
        });
        if (error) throw error;

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Authentication failed. Please try email login.");
      }
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            <img src={logo} alt="Logo" className="h-14 w-14 rounded-md object-cover" />
            <div className="text-left">
              <span className="font-heading text-xl font-bold text-primary">RAHE KABA</span>
              <span className="block text-xs tracking-[0.25em] text-muted-foreground uppercase">Tours & Travels</span>
            </div>
          </a>
          <h1 className="font-heading text-2xl font-bold mt-4">
            {mode === "login" && "Welcome Back"}
            {mode === "register" && "Create Account"}
            {mode === "otp" && "Phone Login"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" && "Sign in to your account"}
            {mode === "register" && "Join us for your sacred journey"}
            {mode === "otp" && "Login with your phone number"}
            {mode === "forgot" && "We'll send you a reset link"}
          </p>
        </div>

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleEmailLogin} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-10`} placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-10 pr-10`} placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>

            <button type="button" onClick={() => setMode("otp")}
              className="w-full border border-border text-foreground font-medium py-3 rounded-md text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" /> Login with Phone OTP
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className={inputClass} placeholder="Enter your full name" maxLength={100} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-10`} placeholder="your@email.com" maxLength={255} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClass} pl-10`} placeholder="+8801XXXXXXXXX" maxLength={15} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-10 pr-10`} placeholder="Create a strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {rule.test(password) ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      <span className={rule.test(password) ? "text-emerald-500" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading || !isPasswordStrong}
              className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {mode === "otp" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input type="tel" value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)}
                      className={`${inputClass} pl-10`} placeholder="+8801XXXXXXXXX" maxLength={15} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Enter the phone number linked to your account</p>
                </div>
                <button onClick={handleSendOtp} disabled={loading}
                  className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-center text-muted-foreground">
                  Enter the 6-digit code sent to <span className="text-primary font-medium">{otpPhone}</span>
                </p>
                <div>
                  <input type="text" inputMode="numeric" maxLength={6} value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`}
                    placeholder="000000" />
                </div>
                <button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6}
                  className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button onClick={() => { setOtpSent(false); setOtpCode(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Resend or change number
                </button>
              </>
            )}
          </div>
        )}

        {/* Forgot Password */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  className={`${inputClass} pl-10`} placeholder="your@email.com" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Mode switching */}
        <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
          {mode === "login" && (
            <p>Don't have an account?{" "}
              <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">Sign Up</button>
            </p>
          )}
          {mode === "register" && (
            <p>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Sign In</button>
            </p>
          )}
          {(mode === "otp" || mode === "forgot") && (
            <p>
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">← Back to Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
