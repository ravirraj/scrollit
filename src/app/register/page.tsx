"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from 'framer-motion'

function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        general: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Email validation
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Username validation
    const validateUsername = (username: string) => {
        return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
    }

    // Password validation
    const validatePassword = (password: string) => {
        return password.length >= 6
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            general: ""
        }

        if (!username.trim()) {
            newErrors.username = "Username is required"
        } else if (!validateUsername(username)) {
            newErrors.username = "Username must be at least 3 characters and contain only letters, numbers, and underscores"
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

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return !newErrors.email && !newErrors.username && !newErrors.password && !newErrors.confirmPassword
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({ email: "", username: "", password: "", confirmPassword: "", general: "" })
        
        // Validate form
        if (!validateForm()) {
            return
        }

        setIsLoading(true)
           
        try {
            const res = await fetch('/api/auth/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username ,email, password })
            })

            const data = await res.json()
            if (!res.ok) {
                setErrors(prev => ({
                    ...prev,
                    general: data.message || "Registration failed. Please try again."
                }))
            } else {
                // Registration successful, redirect to login page
                router.push('/login')
            }
        } catch (error) {
            console.log("Error during registration:", error)
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
                    Join SCROLLIT 💫
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
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border transition ${
                                errors.username 
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                                    : 'border-gray-700 focus:ring-2 focus:ring-pink-500'
                            } focus:outline-none`}
                        />
                        {errors.username && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mt-1 ml-1"
                            >
                                {errors.username}
                            </motion.p>
                        )}
                    </div>

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

                    <div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border transition ${
                                errors.confirmPassword 
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                                    : 'border-gray-700 focus:ring-2 focus:ring-pink-500'
                            } focus:outline-none`}
                        />
                        {errors.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mt-1 ml-1"
                            >
                                {errors.confirmPassword}
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
                                Creating account...
                            </div>
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-6">
                    Already have an account?{" "}
                    <span className="text-pink-500 hover:underline cursor-pointer" onClick={() => router.push('/login')}>Login</span>
                </p>
            </motion.div>
        </div>
    );
}

export default RegisterPage