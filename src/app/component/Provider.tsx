import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";


const URL_ENDPOINT = process.env.NEXT_PUBLIC_URL_IMAGEKIT_ENDPOINT || "";

if (!URL_ENDPOINT) {
  throw new Error("NEXT_PUBLIC_URL_IMAGEKIT_ENDPOINT is not defined");
}






export default function Provider({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={5 * 60}>
    <ImageKitProvider urlEndpoint={URL_ENDPOINT}>
      {children}
    </ImageKitProvider>
  </SessionProvider>;
}