import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react";

export default function CustomAuth() {
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isUserLoaded && user) {
      navigate("/role-selection");
    }
  }, [isUserLoaded, user, navigate]);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    // ... existing login logic ...
    e.preventDefault();
    if (!isSignInLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: signInData.email,
        password: signInData.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/role-selection");
      } else {
        console.log("SignIn incomplete", result);
        setError("Login requires further steps not supported in this form yet.");
      }
    } catch (err: any) {
      console.error("SignIn error:", err);
      setError(err.errors?.[0]?.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signUp.create({
        firstName: signUpData.name.split(" ")[0],
        lastName: signUpData.name.split(" ").slice(1).join(" ") || "",
        emailAddress: signUpData.email,
        password: signUpData.password,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate("/role-selection");
      } else {
        // Send email code
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      }
    } catch (err: any) {
      console.error("SignUp error:", err);
      setError(err.errors?.[0]?.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate("/role-selection");
      } else {
        console.log("Verification incomplete", result);
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
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

        .social-icons {
          margin: 20px 0;
        }

        .social-icons a {
          border: 1px solid #ccc;
          border-radius: 20%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin: 0 3px;
          width: 40px;
          height: 40px;
          transition: all 0.3s;
        }

        .social-icons a:hover {
          border-color: #512da8;
        }

        .social-icons a.google {
          color: #4285F4;
        }

        .social-icons a.facebook {
          color: #1877F2;
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
              <div className="social-icons">
                <a href="#" className="google"><i className="fa-brands fa-google"></i></a>
                <a href="#" className="facebook"><i className="fa-brands fa-facebook-f"></i></a>
              </div>
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
              {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
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
                <div className="social-icons">
                  <a href="#" className="google"><i className="fa-brands fa-google"></i></a>
                  <a href="#" className="facebook"><i className="fa-brands fa-facebook-f"></i></a>
                </div>
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
                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
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