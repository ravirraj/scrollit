import mongoose , {model , models , Schema} from "mongoose"


export const VIDEO_DIMENTIONS = {
    height:1920,
    width:1080
}as const

export interface IVideo{
    userId: mongoose.Types.ObjectId;
    videoUrl:string;
    title:string;
    description:string;
    thumbnailUrl:string;
    transform?:{
        width:number;
        height:number;
        quality :number
    }
}


const videoSchema = new Schema<IVideo>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    videoUrl:{
        type:String,
        required:true
    },
    title: {
        type :String,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true,
        maxlength:2200
    },
    thumbnailUrl:{
        type:String,
        required:true
    },
    transform:{
        width:Number,
        height:Number,
        quality : Number
    }
},{timestamps:true})        


const Video = models?.Video || model<IVideo>("Video", videoSchema)

export default Video