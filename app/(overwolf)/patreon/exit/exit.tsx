"use client";
import { OVERWOLF_APP_UID } from "@/app/lib/env";
import { useSearchParams } from "next/navigation";

export default function Exit() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (!code) {
    return (
      <div className="h-screen text-center pt-4 bg-black">
        Something went wrong, please try again.
      </div>
    );
  }
  return (
    <div className="h-screen text-center pt-4 bg-black">
      {code ? (
        <>
          <p className="my-2 mx-auto max-w-xl text-center">
            Thank you for your support 🤘. Please click the following button to
            sync your subscription status with the Overwolf app. Make sure the
            app is running!
          </p>
          <a
            href={`overwolf-extension://${OVERWOLF_APP_UID}/patreon.html#code=${code}`}
            className="block w-fit mx-auto p-2 uppercase text-white bg-[#ff424d] hover:bg-[#ca0f25]"
          >
            Send Patreon Code to App
          </a>
        </>
      ) : (
        "Something went wrong, please try again."
      )}
    </div>
  );
}
