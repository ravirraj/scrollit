"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation
  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: ""
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({ email: "", password: "", general: "" })
    
    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        setErrors(prev => ({
          ...prev,
          general: "Invalid email or password. Please try again."
        }))
      } else if (result?.ok) {
        console.log("Login successful!")
        router.push('/dashboard')
      }
    } catch (error) {
      console.log("Error during login:", error)
      setErrors(prev => ({
        ...prev,
        general: "Something went wrong. Please try again."
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center text-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-md border border-pink-500/30 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500">
          Welcome Back 👋
        </h2>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-center text-sm"
          >
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border transition ${
                errors.email 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-700 focus:ring-2 focus:ring-pink-500'
              } focus:outline-none`}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-1 ml-1"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border transition ${
                errors.password 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-700 focus:ring-2 focus:ring-pink-500'
              } focus:outline-none`}
            />
            {errors.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-1 ml-1"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition transform ${
              isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700 hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <span className="text-pink-500 hover:underline cursor-pointer" onClick={() => router.push('/register')}>Register</span>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;