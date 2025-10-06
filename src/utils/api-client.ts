import { IVideo } from "@/models/Video.models";

export type videoType = Omit<IVideo, "_id">;

type fetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
};


class ApiClient {
    private async fetch<T>(url: string, options: fetchOptions = {}): Promise<T> {
        const method = options.method || "GET";
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };
       const response = await fetch(`api/${url}`, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    async getVideos() {
        return this.fetch("/videos");
    }

    async createVideo(data : videoType) {
        return this.fetch("/videos", {
            method: "POST",
            body: data,
        });
    }

    }



    export const apiClient = new ApiClient(); 