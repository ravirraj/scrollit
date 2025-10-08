"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from 'framer-motion'


function Page() {
    const [email , setEmail] = useState("")
    const [username , setUsername] = useState("")
    const [password , setPassword] = useState("")
    const [confirmPassword , setConfirmPassword] = useState("")
    const router = useRouter()


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

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl bg-gray-900 placeholder-gray-500 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />

        <button className="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-xl font-bold text-white shadow-lg transition transform hover:scale-105">
          Register
        </button>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <span className="text-pink-500 hover:underline cursor-pointer" onClick={() => router.push('/login')}>Login</span>
        </p>
      </motion.div>
    </div>
  );

}

export default Page