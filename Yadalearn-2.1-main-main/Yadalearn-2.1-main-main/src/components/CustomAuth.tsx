import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomAuth() {
  const { user, isLoaded: isUserLoaded, userRole, onboardingCompleted, login, signUpWithEmail, signInWithGoogle } = useAuth();

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isUserLoaded && user) {
      if (onboardingCompleted) {
        if (userRole === 'teacher') {
          navigate("/teacher-dashboard");
        } else if (userRole === 'student') {
          navigate("/student-dashboard");
        } else {
          navigate("/role-selection");
        }
      } else {
        if (userRole) {
          navigate("/onboarding", { state: { role: userRole } });
        } else {
          navigate("/role-selection");
        }
      }
    }
  }, [isUserLoaded, user, userRole, onboardingCompleted, navigate]);

  useEffect(() => {
    const oauthError = sessionStorage.getItem('oauth_error');
    if (oauthError) {
      setError(oauthError);
      sessionStorage.removeItem('oauth_error');
    }
  }, []);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const getFriendlyErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes("rate limit exceeded")) {
      return "Signup rate limit exceeded. Please wait a minute before trying again. (If you are the admin, you can adjust this limit in your Supabase Dashboard under Settings -> Auth -> Rate Limits).";
    }
    if (errorMsg.includes("email_not_confirmed")) {
      return "Please confirm your email address by clicking the link sent to your inbox before signing in.";
    }
    return errorMsg;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await login(signInData.email, signInData.password);
    } catch (err: any) {
      console.error("SignIn error:", err);
      setError(getFriendlyErrorMessage(err.message || "Failed to sign in"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const data = await signUpWithEmail(signUpData.email, signUpData.password, signUpData.name);
      if (!data?.session) {
        setSuccessMsg("Account created! Please check your email to confirm your registration before signing in.");
      }
    } catch (err: any) {
      console.error("SignUp error:", err);
      setError(getFriendlyErrorMessage(err.message || "Failed to sign up"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(getFriendlyErrorMessage(err.message || "Failed to sign in with Google"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("Verification is currently disabled");
  };

  return (
    <>
      {/* ... styles ... */}
      <style>{`
        /* ... existing styles ... */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Montserrat', sans-serif;
        }

        .main-wrapper {
          background: linear-gradient(to right, #e2e2e2, #c9d6ff);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          background-color: #fff;
          border-radius: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 480px;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .sign-in {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .container.active .sign-in {
          transform: translateX(100%);
        }

        .sign-up {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .container.active .sign-up {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: move 0.6s;
        }

        @keyframes move {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }

        .form-content {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          height: 100%;
        }

        .form-content h1 {
          font-size: 28px;
          margin-bottom: 20px;
        }

        .google-btn {
          background-color: #ffffff;
          color: #333333;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s;
          margin: 15px 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .google-btn:hover {
          background-color: #f8fafc;
          border-color: #cbd5e0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .google-btn svg {
          margin-right: 8px;
        }

        span {
          font-size: 12px;
          margin-bottom: 10px;
        }

        input {
          background-color: #eee;
          border: none;
          margin: 8px 0;
          padding: 10px 15px;
          font-size: 13px;
          border-radius: 8px;
          width: 100%;
          outline: none;
        }

        a {
          color: #333;
          font-size: 13px;
          text-decoration: none;
          margin: 15px 0 10px;
        }

        a:hover {
          color: #512da8;
        }

        button {
          background-color: #512da8;
          color: #fff;
          font-size: 12px;
          padding: 10px 45px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        button:hover {
          background-color: #6a3fb8;
        }

        button.hidden-btn {
          background-color: transparent;
          border-color: #fff;
        }

        button.hidden-btn:hover {
          background-color: #fff;
          color: #512da8;
        }

        .toggle-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: all 0.6s ease-in-out;
          border-radius: 150px 0 0 100px;
          z-index: 1000;
        }

        .container.active .toggle-container {
          transform: translateX(-100%);
          border-radius: 0 150px 100px 0;
        }

        .toggle {
          background: linear-gradient(to right, rgba(92, 107, 192, 0.8), rgba(81, 45, 168, 0.8)),
                      url('/teacher-auth.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 100%;
          color: #fff;
          position: relative;
          left: -100%;
          width: 200%;
          transform: translateX(0);
          transition: all 0.6s ease-in-out;
        }

        .container.active .toggle {
          background: linear-gradient(to right, rgba(92, 107, 192, 0.8), rgba(81, 45, 168, 0.8)),
                      url('/student-auth.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: translateX(50%);
        }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 30px;
          text-align: center;
          top: 0;
          transform: translateX(0);
          transition: all 0.6s ease-in-out;
        }

        .toggle-left {
          transform: translateX(-200%);
        }

        .container.active .toggle-left {
          transform: translateX(0);
        }

        .toggle-right {
          right: 0;
          transform: translateX(0);
        }

        .container.active .toggle-right {
          transform: translateX(200%);
        }

        .toggle-panel h1 {
          color: #fff;
        }

        .toggle-panel p {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.3px;
          margin: 20px 0;
        }
      `}</style>

      {/* ... rest of your UI ... */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
      />

      <div className="main-wrapper">
        <div className={`container ${isActive ? 'active' : ''}`}>

          <div className="form-container sign-in">
            <form className="form-content" onSubmit={handleSignIn}>
              <h1>Sign In</h1>
              <button type="button" onClick={handleGoogleSignIn} className="google-btn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <span>or use your email password</span>
              <input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                required
              />
              {error && <p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>{error}</p>}
              {successMsg && <p style={{ color: "green", fontSize: "12px", marginTop: "10px" }}>{successMsg}</p>}
              <a href="#">Forget Your Password?</a>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="form-container sign-up">
            {pendingVerification ? (
              <form className="form-content" onSubmit={handleVerify}>
                <h1>Verify Email</h1>
                <span>Enter the code sent to your email</span>
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            ) : (
              <form className="form-content" onSubmit={handleSignUp}>
                <h1>Create Account</h1>
                <button type="button" onClick={handleGoogleSignIn} className="google-btn">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                <span>or use your email for registration</span>
                <input
                  type="text"
                  placeholder="Name"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                />
                {error && <p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>{error}</p>}
                {successMsg && <p style={{ color: "green", fontSize: "12px", marginTop: "10px" }}>{successMsg}</p>}
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
            )}
          </div>
          {/* ... toggle containers ... */}


          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Enter your personal details to use all of site features</p>
                <button className="hidden-btn" onClick={() => setIsActive(false)}>
                  Sign In
                </button>
              </div>
              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>Register with your personal details to use all of site features</p>
                <button className="hidden-btn" onClick={() => setIsActive(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}