import CredentialsProvider from "next-auth/providers/credentials"
import { dbConnect } from "./db"
import User from "@/models/User.models"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
export const authOptions : NextAuthOptions = {
    providers: [
        // add your providers here
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" }
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password){
                    throw new Error("All fields are required")
                }

                try {
                    await dbConnect()
                    // Find the user by email
                    const user = await User.findOne({email:credentials.email}).select("+password")
                    if(!user){
                        throw new Error("no user found with this email")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)
                    if(!isPasswordCorrect){
                        throw new Error("Invalid credentials")
                    }

                    return {
                        id:user._id.toString(),
                        email:user.email,
                        name:user.name
                    }
                } catch (error) {
                    console.log("error logging the user", error)
                    throw new Error("Internal error")
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user}: {token: JWT, user: any}) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}: {session: Session, token: JWT}) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages:{
        signIn:"/login",
        error:"/login"
    },
    session:{
        strategy:"jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret:process.env.NEXTAUTH_SECRET
}