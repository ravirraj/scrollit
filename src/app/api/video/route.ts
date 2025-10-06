import { dbConnect } from "@/utils/db";
import Video, { IVideo } from "@/models/Video.models";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { Bona_Nova } from "next/font/google";

export async function GET() {
    try {
        await dbConnect()

        const videos = await Video.find({}).sort({createdAt:-1}).lean().populate('userId')

        if(videos.length === 0 || !videos)  {
            return new NextResponse("No videos found", { status: 404 })


        }

        return NextResponse.json({videos} , {status:200} )
    } catch (error) {
        console.error("Error fetching videos:", error)
        return new NextResponse("Error fetching videos", { status: 500 })
    }
}


export async function POST(request: NextRequest) {
    try {
        console.log('POST /api/video called');
        
        const session = await getServerSession(authOptions);
        console.log('Session from getServerSession:', session);
        
        if (!session || !session.user?.id) {
            console.log('No session or user ID found');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log('User authenticated:', session.user.id);

        await dbConnect()

        const body = await request.json()
        console.log('Request body:', body);

        if (!body.title || !body.videoUrl) {
            return NextResponse.json({ 
                error: "Title and video URL are required" 
            }, { status: 400 })
        }

        const videoData = {
            userId: session.user.id,
            videoUrl: body.videoUrl,
            title: body.title,
            description: body.description || "",
            thumbnailUrl: body.thumbnailUrl || body.videoUrl,
            transform: {
                width: body.transform?.width || 1920,
                height: body.transform?.height || 1080,
                quality: body.transform?.quality || 80
            }
        }

        const newVideo = await Video.create(videoData)
        return NextResponse.json({ 
            success: true, 
            video: newVideo 
        }, { status: 201 })

    } catch (error) {
        console.log("Error uploading the video:", error)
        return NextResponse.json({ 
            error: "Error while uploading the video" 
        }, { status: 500 })
    }
}
 