import { NextRequest,NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import User from "@/models/User.models";


export async function POST(request:NextRequest){
    try {
        const {name,email,password} = await request.json()

        if(!name || !email || !password){
            return NextResponse.json({message:"All fields are required"},{status:400})
        }

        await dbConnect()

        const existingUser = await User.findOne({email})

        if(existingUser){
            return NextResponse.json({message:"User already exists"},{status:400})
        }
        const user = await User.create({name,email,password})
        await user.save()


        return NextResponse.json({message:"User registered successfully"},{status:201})
    } catch (error) {
        console.log("registration error:",error)
        return NextResponse.json({message:"Internal server error"},{status:500})
    }
}