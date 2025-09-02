import React, { useState } from 'react';
import { Card, CardBody, Input, Button, Snippet } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { motion } from "framer-motion";
import '../styles/admin.css';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const data = await authService.login({ email: username, password });
        login(data.token, data.refreshToken, data.user, data.isAdmin);
        
        if (data.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        await authService.register({ name, email: username, password, phone });
        setSuccessMsg('Registration successful! Please login.');
        setTimeout(() => {
          setSuccessMsg(null);
          setIsLogin(true);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.message || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
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
  className="w-full max-w-sm"  // reduced from max-w-md
>
  <motion.div
    animate={{
      boxShadow: [
        "0 0 20px rgba(220, 38, 38, 0.3)",
        "0 0 40px rgba(220, 38, 38, 0.6)",
        "0 0 20px rgba(220, 38, 38, 0.3)"
      ],
    }}
    transition={{ duration: 3, repeat: Infinity }}
    className="rounded-2xl"
  >
    <Card className="w-full bg-zinc-900/90 backdrop-blur-sm border border-red-600 shadow-2xl rounded-2xl relative z-30">
      <CardBody className="p-6"> {/* reduced from p-8 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}  // slightly smaller
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-4"
        >
          {/* <Icon icon="lucide:shield" className="w-10 h-10 text-red-500" />  */}
          <h1 className="text-xl font-bold text-red-500 mt-2">{isLogin ? 'Login' : 'Register'}</h1>
          <p className="text-xs text-gray-400">{isLogin ? 'Secure Access' : 'Create Account'}</p>
        </motion.div>


              {errorMsg && (
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [0, -8, 8, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Snippet
                    hideCopyButton
                    color="danger"
                    className="mb-4 w-full text-center bg-red-900/50 border border-red-600 text-red-400"
                  >
                    {errorMsg}
                  </Snippet>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Snippet
                    hideCopyButton
                    color="success"
                    className="mb-4 w-full text-center bg-green-900/50 border border-green-600 text-green-400"
                  >
                    {successMsg}
                  </Snippet>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <Input
                    type="text"
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    startContent={<Icon icon="lucide:user" className="text-red-500" />}
                    classNames={{
                      inputWrapper:
                        "bg-black border border-red-700 hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black",
                      input: "text-white placeholder-gray-500",
                    }}
                    required
                  />
                )}
                <Input
                  type={isLogin ? "text" : "email"}
                  label={isLogin ? "Email or Username" : "Email"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  startContent={<Icon icon="lucide:mail" className="text-red-500" />}
                  classNames={{
                    inputWrapper:
                      "bg-black border border-red-700 hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black",
                    input: "text-white placeholder-gray-500",
                  }}
                  required
                />

                <Input
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startContent={<Icon icon="lucide:lock" className="text-red-500" />}
                  classNames={{
                    inputWrapper:
                      "bg-black border border-red-700 hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black",
                    input: "text-white placeholder-gray-500",
                  }}
                  required
                />

                {!isLogin && (
                  <Input
                    type="tel"
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    startContent={<Icon icon="lucide:phone" className="text-red-500" />}
                    classNames={{
                      inputWrapper:
                        "bg-black border border-red-700 hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black",
                      input: "text-white placeholder-gray-500",
                    }}
                    required
                  />
                )}


                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={loading}
                    className="heading-font bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"
                  >
                    {isLogin ? 'LOGIN' : 'REGISTER'}
                  </Button>
                </motion.div>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-red-500 hover:text-red-400 underline"
                  >
                    {isLogin ? 'Register' : 'Login'}
                  </button>
                </p>
              </div>

              <div className="flex items-center justify-center mt-4 space-x-2">
                <Icon icon="lucide:circle" className="w-2 h-2 text-red-500" />
                <p className="text-xs text-gray-500">© 2025 Bushido Systems</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
