import { dbConnect } from "@/utils/db";
import Video, { IVideo } from "@/models/Video.models";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { Bona_Nova } from "next/font/google";

export async function GET() {
    try {
        await dbConnect()

        const videos = await Video.find({}).sort({createdAt:-1}).lean()

        if(videos.length === 0 || !videos)  {
            return new NextResponse("No videos found", { status: 404 })


        }

        return NextResponse.json({videos} , {status:200} )
    } catch (error) {
        console.error("Error fetching videos:", error)
        return new NextResponse("Error fetching videos", { status: 500 })
    }
}


export async function POST(request:NextRequest){
    try {
        const session = await getServerSession(authOptions)
        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        await dbConnect()


        const body : IVideo = await request.json()

        if(!body.title || !body.description || !body.videoUrl) {
            return NextResponse.json({error:"every field is required"},{status:400})
        }

        const videoData = {
            ...body,
            transform:{
        width:1920,
        height:1080,
        quality : body.transform?.quality?? 100
    }
            
        }

        const newVideo = await Video.create(videoData)
        return NextResponse.json(newVideo)


    } catch (error) {
        console.log("Error uploading the video ", error)
        return NextResponse.json({error:"error while uploading the video"}, {status:500})
    }
}
 