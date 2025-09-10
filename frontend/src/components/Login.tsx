import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Button, Alert, Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import { motion } from "framer-motion";
import '../styles/admin.css';

export const Login: React.FC<{ siteClosed?: boolean }> = ({ siteClosed = false }) => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "token" | "password">(
    "email"
  );

  const { login, register, user } = useAuth();
  const [authService, setAuthService] = useState<any>(null);

  useEffect(() => {
    import("../services/authService").then((module) => {
      setAuthService(module.authService);
    });
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.mode === "register") {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Check maintenance mode before attempting auth
    if (siteClosed) {
      if (!isLogin) {
        setErrorMsg(
          "Registration is currently unavailable due to maintenance."
        );
        setLoading(false);
        setTimeout(() => navigate("/", { replace: true }), 2000);
        return;
      }
    }

    // Validate phone number for registration
    if (!isLogin && !/^\d{10}$/.test(phone)) {
      setErrorMsg("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(username, password);

        // Check if backend returned maintenance message
        if (result?.message && result.message.includes("maintainance")) {
          setErrorMsg("Site is under maintenance. Please try again later.");
          setTimeout(() => navigate("/", { replace: true }), 2000);
        } else if (result?.user?.isAdmin) {
          navigate("/admin", { replace: true });
        } else if (siteClosed) {
          setErrorMsg("Site is under maintenance. Please try again later.");
          setTimeout(() => navigate("/", { replace: true }), 2000);
        } else {
          navigate("/", { replace: true });
        }
      } else {
        await register(name, username, password, phone);
        if (siteClosed) {
          setSuccessMsg("Registration successful! Site is under maintenance.");
          setTimeout(() => navigate("/", { replace: true }), 2000);
        } else {
          setSuccessMsg("Registration successful! You are now logged in.");
          setTimeout(() => navigate("/", { replace: true }), 1000);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage =
        error.message ||
        (isLogin
          ? "Invalid credentials"
          : "Registration failed. Please try again.");
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authService) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (resetStep === "email") {
        const result = await authService.forgotPassword(resetEmail);
        setSuccessMsg(`Reset token sent! Token: ${result.resetToken}`);
        setResetStep("token");
      } else if (resetStep === "token") {
        setResetStep("password");
      } else if (resetStep === "password") {
        await authService.resetPassword(resetEmail, resetToken, newPassword);
        setSuccessMsg("Password reset successfully! You can now login.");
        setShowForgotPassword(false);
        setResetStep("email");
        setResetEmail("");
        setResetToken("");
        setNewPassword("");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep("email");
    setResetEmail("");
    setResetToken("");
    setNewPassword("");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/images/boom1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm" // reduced from max-w-md
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(220, 38, 38, 0.3)",
              "0 0 40px rgba(220, 38, 38, 0.6)",
              "0 0 20px rgba(220, 38, 38, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="rounded-2xl"
        >
          <Card
            sx={{
              backgroundColor: "rgba(24, 24, 27, 0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid #dc2626",
              borderRadius: "16px",
              position: "relative",
              zIndex: 30,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} // slightly smaller
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center mb-4"
              >
                {/* <Icon icon="lucide:shield" className="w-10 h-10 text-red-500" />  */}
                <h1 className="text-xl font-bold text-red-500 mt-2">
                  {showForgotPassword
                    ? "Reset Password"
                    : isLogin
                    ? "Login"
                    : "Register"}
                </h1>
                <p className="text-xs text-gray-400">
                  {showForgotPassword
                    ? "Enter your details"
                    : isLogin
                    ? "Secure Access"
                    : "Create Account"}
                </p>
              </motion.div>

              {errorMsg && (
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [0, -8, 8, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      backgroundColor: "rgba(127, 29, 29, 0.5)",
                      border: "1px solid #dc2626",
                      color: "#fca5a5",
                    }}
                  >
                    {errorMsg}
                  </Alert>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert
                    severity="success"
                    sx={{
                      mb: 2,
                      backgroundColor: "rgba(20, 83, 45, 0.5)",
                      border: "1px solid #16a34a",
                      color: "#86efac",
                    }}
                  >
                    {successMsg}
                  </Alert>
                </motion.div>
              )}

              <Box
                component="form"
                onSubmit={
                  showForgotPassword ? handleForgotPassword : handleSubmit
                }
                sx={{ "& > :not(style)": { mb: 2.5 } }}
              >
                {showForgotPassword ? (
                  <>
                    {resetStep === "email" && (
                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <Icon
                              icon="lucide:mail"
                              className="text-red-500 mr-2"
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#dc2626",
                          },
                        }}
                        required
                      />
                    )}
                    {resetStep === "token" && (
                      <TextField
                        fullWidth
                        type="text"
                        label="Reset Token (6 digits)"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <Icon
                              icon="lucide:key"
                              className="text-red-500 mr-2"
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#dc2626",
                          },
                        }}
                        required
                      />
                    )}
                    {resetStep === "password" && (
                      <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <Icon
                              icon="lucide:lock"
                              className="text-red-500 mr-2"
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#dc2626",
                          },
                        }}
                        required
                      />
                    )}
                  </>
                ) : (
                  <>
                    {!isLogin && (
                      <TextField
                        fullWidth
                        type="text"
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <Icon
                              icon="lucide:user"
                              className="text-red-500 mr-2"
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#dc2626",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& input:-webkit-autofill": {
                              WebkitBoxShadow: "0 0 0 1000px transparent inset",
                              WebkitTextFillColor: "white",
                            },
                          },
                        }}
                        required
                      />
                    )}
                    <TextField
                      fullWidth
                      type={isLogin ? "text" : "email"}
                      label={isLogin ? "Email or Username" : "Email"}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: (
                          <Icon
                            icon="lucide:mail"
                            className="text-red-500 mr-2"
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#dc2626",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& input:-webkit-autofill": {
                            WebkitBoxShadow: "0 0 0 1000px transparent inset",
                            WebkitTextFillColor: "white",
                          },
                        },
                      }}
                      required
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      InputProps={{
                        startAdornment: (
                          <Icon
                            icon="lucide:lock"
                            className="text-red-500 mr-2"
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#dc2626",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& input:-webkit-autofill": {
                            WebkitBoxShadow: "0 0 0 1000px transparent inset",
                            WebkitTextFillColor: "white",
                          },
                        },
                      }}
                      required
                    />
                  </>
                )}

                {!showForgotPassword && !isLogin && (
                  <TextField
                    fullWidth
                    type="tel"
                    label="Phone (10 digits)"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setPhone(value);
                    }}
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <Icon
                          icon="lucide:phone"
                          className="text-red-500 mr-2"
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#dc2626",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& input:-webkit-autofill": {
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                          WebkitTextFillColor: "white",
                        },
                      },
                    }}
                    required
                  />
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      fontFamily: '"Ungai1", sans-serif',
                      backgroundColor: "#dc2626",
                      "&:hover": { backgroundColor: "#b91c1c" },
                      borderRadius: "12px",
                      py: 1.5,
                    }}
                  >
                    {loading
                      ? "Loading..."
                      : showForgotPassword
                      ? resetStep === "email"
                        ? "SEND TOKEN"
                        : resetStep === "token"
                        ? "VERIFY TOKEN"
                        : "RESET PASSWORD"
                      : isLogin
                      ? "LOGIN"
                      : "REGISTER"}
                  </Button>
                </motion.div>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-red-500 hover:text-red-400 underline ml-1"
                    style={{ fontFamily: '"Ungai", sans-serif' }}
                  >
                    Reset Password
                  </button>
                )}
              </Box>

              <div className="text-center mt-6">
                {showForgotPassword ? (
                  <p
                    className="text-sm text-gray-400"
                    style={{ fontFamily: '"Ungai", sans-serif' }}
                  >
                    Remember your password?
                    <button
                      type="button"
                      onClick={resetForgotPassword}
                      className="text-red-500 hover:text-red-400 underline ml-1"
                      style={{ fontFamily: '"Ungai", sans-serif' }}
                    >
                      Back to Login
                    </button>
                  </p>
                ) : (
                  <>
                    <p
                      className="text-sm text-gray-400"
                      style={{ fontFamily: '"Ungai", sans-serif' }}
                    >
                      {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-red-500 hover:text-red-400 underline"
                        style={{ fontFamily: '"Ungai", sans-serif' }}
                      >
                        {isLogin ? "Register" : "Login"}
                      </button>
                    </p>
                    {/* {isLogin && (
                      <p
                        className="text-sm text-gray-400 mt-2"
                        style={{ fontFamily: '"Ungai", sans-serif' }}
                      >
                        Forgot your password?
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-red-500 hover:text-red-400 underline ml-1"
                          style={{ fontFamily: '"Ungai", sans-serif' }}
                        >
                          Reset Password
                        </button>
                      </p>
                    )} */}
                  </>
                )}
              </div>

              <div className="flex items-center justify-center mt-4 space-x-2">
                <Icon icon="lucide:circle" className="w-2 h-2 text-red-500" />
                <p className="text-xs text-gray-500">© 2025 Bushido Systems</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
