"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

function pages() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Perform login logic here
    try {
      await signIn('credentials', {
        redirect: false,
        email,
        password
      }).then((callback) => {
        if (callback?.error) {
          console.log("Login failed:", callback.error)
        }
        if (callback?.ok && !callback?.error) {
          console.log("Login successful!")
          router.push('/dashboard')
        }
      })
    } catch (error) {
      console.log("Error during login:", error)
    }
  }

  return (
    <>
    </>
  )
}

export default pages;