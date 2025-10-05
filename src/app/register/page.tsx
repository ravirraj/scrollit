"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function page() {
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const [confirmPassword , setConfirmPassword] = useState("")
    const router = useRouter()


    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        // Perform registration logic here
        if(password != confirmPassword){
           alert("pass no match")
        return
        }
           
        try {
        const res = await fetch('/api/auth/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()
        if(!res.ok){
            throw new Error(data.message || "regestration failed")
        }
        // Registration successful, redirect to login page
        router.push('/login')
    } catch (error) {
        console.log("Error during registration:", error)
    }
    }
    


  return (
    <div>page</div>
  )
}

export default page