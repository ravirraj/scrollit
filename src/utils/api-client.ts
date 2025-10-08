import { IVideo } from "@/models/Video.models";

export type VideoType = Omit<IVideo, "_id"> & { 
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
};

class ApiClient {
    private async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const method = options.method || "GET";
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };
        
        const response = await fetch(`/api/${url}`, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        console.log(response)

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    async getVideos(): Promise<{ videos: VideoType[] }> {
        return this.fetch<{ videos: VideoType[] }>("/video");
    }

    async createVideo(data: VideoType): Promise<{ success: boolean; video: VideoType }> {
        return this.fetch<{ success: boolean; video: VideoType }>("/video", {
            method: "POST",
            body: data,
        });
    }
}

export const apiClient = new ApiClient();