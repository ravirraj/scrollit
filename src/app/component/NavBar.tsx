"use client";
import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-lg border-b border-pink-500/20 flex justify-between items-center px-6 py-3 z-50">
      <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 tracking-wider">
        SCROLLIT
      </h1>
      <div className="flex space-x-4">
        <button className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition transform hover:scale-105">
          Login
        </button>
        <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-pink-600 text-white font-semibold border border-pink-500/40 transition transform hover:scale-105">
          Register
        </button>
      </div>
    </nav>
  );
}
