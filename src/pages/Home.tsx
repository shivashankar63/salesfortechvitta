import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase, signInWithEmail, signUpWithEmail } from "@/lib/supabase";

type UserRole = "owner" | "manager" | "salesman";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("salesman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up logic
        const { data, error: signUpError } = await signUpWithEmail(email, password);
        
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Create user profile in database
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email,
              full_name: fullName,
              role: selectedRole,
            }]);

          if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
          }

          setSuccessMessage("Account created successfully! Logging you in...");
          setTimeout(() => {
            const dashboardRoute = {
              owner: '/owner',
              manager: '/manager',
              salesman: '/salesman',
            };
            navigate(dashboardRoute[selectedRole], { replace: true });
          }, 1500);
        }
      } else {
        // Login logic
        const { data, error: loginError } = await signInWithEmail(email, password);
        
        if (loginError) {
          setError(loginError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Fetch user role
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (userData) {
            const dashboardRoute = {
              owner: '/owner',
              manager: '/manager',
              salesman: '/salesman',
            };
            navigate(dashboardRoute[userData.role as UserRole], { replace: true });
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold">SalesFlow</span>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAuthForm(!showAuthForm)}
          >
            {showAuthForm ? "Back to Home" : "Get Started"}
          </Button>
        </div>
      </nav>

      {!showAuthForm ? (
        <>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Your Sales,
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      {" "}Elevated.
                    </span>
                  </h1>
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    Manage leads, track performance, and drive sales growth with our intuitive platform. 
                    Real-time insights for your entire sales organization.
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Real-time Analytics</h3>
                      <p className="text-blue-100 text-sm">Get instant insights into your sales pipeline</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Team Collaboration</h3>
                      <p className="text-blue-100 text-sm">Seamlessly manage your team's performance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Automated Lead Management</h3>
                      <p className="text-blue-100 text-sm">Never lose track of important leads</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-8 py-6"
                    onClick={() => setShowAuthForm(true)}
                  >
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Side - Stats Preview */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl font-bold text-blue-300 mb-2">$2.4M</div>
                  <div className="text-white/70">Total Pipeline Value</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl font-bold text-green-400 mb-2">42%</div>
                  <div className="text-white/70">Conversion Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">245</div>
                  <div className="text-white/70">Active Leads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl font-bold text-purple-400 mb-2">12</div>
                  <div className="text-white/70">Team Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-white/10 backdrop-blur-sm py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose SalesFlow?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Performance Tracking</h3>
                  <p className="text-white/60">Monitor team performance with real-time metrics and detailed analytics</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Lead Management</h3>
                  <p className="text-white/60">Organize and manage all your leads in one centralized platform</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Role-Based Access</h3>
                  <p className="text-white/60">Different views for owners, managers, and salespeople</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 backdrop-blur-sm py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/60">
              <p>© 2026 SalesFlow. All rights reserved.</p>
            </div>
          </div>
        </>
      ) : (
        /* Auth Form Section */
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">
                {isSignUp ? "Create Account" : "Welcome back"}
              </h2>
              <p className="text-white/60 text-center mb-8">
                {isSignUp
                  ? "Sign up with your email to get started"
                  : "Sign in to your account to continue"}
              </p>

              {/* Error Alert */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {successMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <Mail className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name - Only for Sign Up */}
                {isSignUp && (
                  <div>
                    <Label htmlFor="fullName" className="text-white/90 font-medium mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-white/90 font-medium mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-white/90 font-medium mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role Selection - Only for Sign Up */}
                {isSignUp && (
                  <div>
                    <Label className="text-white/90 font-medium mb-3 block">
                      Select Your Role
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["owner", "manager", "salesman"] as UserRole[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`py-3 px-4 rounded-lg font-medium transition-all ${
                            selectedRole === role
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              {/* Toggle between Sign In and Sign Up */}
              <div className="mt-6 text-center">
                {!isSignUp && (
                  <>
                    <p className="text-white/60 mb-4">Don't have an account?</p>
                    <button
                      onClick={() => {
                        setIsSignUp(true);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign up here
                    </button>
                  </>
                )}
                {isSignUp && (
                  <>
                    <p className="text-white/60 mb-4">Already have an account?</p>
                    <button
                      onClick={() => {
                        setIsSignUp(false);
                        setError("");
                        setSuccessMessage("");
                        setFullName("");
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;


