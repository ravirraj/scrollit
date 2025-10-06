"use client"

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import {  useState } from "react";


interface FileUploadProps {
    onSuccess?: (response: any) => void;
    onProgress?: (progress: number) => void;
    fileType?: "image" | "video";
}

const FileUpload = ({onSuccess , onProgress , fileType}: FileUploadProps) => {
    const [progress, setProgress] = useState(0);
    const [error , setError]= useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const validateFile = (file: File) => {
        if (fileType === "video") {
            const validTypes = ["video/mp4", "video/avi", "video/mov", "video/mkv"];
            if (!validTypes.includes(file.type)) {
                setError(`Invalid file type. Please upload a video file (${validTypes.join(", ")}).`);
                return false;
            }
            const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSizeInBytes) {
                setError(`File size exceeds the maximum limit of 100MB.`);
                return false;
            }
        }
        return true;
    }


   const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !validateFile(file)) return;
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
        const authRes = await fetch('/api/auth/imagekit-auth');
        const authData = await authRes.json();

        const res = await upload({
                expire: authData.expire,
                token: authData.token,
                signature: authData.signature,
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
                file,
                fileName: file.name, // Optionally set a custom file name
                // Progress callback to update upload progress state
                onProgress: (event) => {
                    setProgress((event.loaded / event.total) * 100);
                },
        })

        onSuccess && onSuccess(res);
    } catch (error) {
        setError("An error occurred while uploading the file.");
    } finally {
        setUploading(false);
    }
   }



    return (
        <>
            {/* File input element using React ref */}
            <input type="file" accept={fileType === "image" ? "image/*" : "video/*"} 
            onChange={handleChange}
            />
            {progress > 0 && <p>Upload Progress: {progress}%</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <br />


        </>
    );
};

export default FileUpload;