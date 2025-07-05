import { NextResponse } from "next/server";
import { createAuthorizeURL } from "@/lib/spotify";

export async function GET() {
  try {
    const url = createAuthorizeURL();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Spotify authentication" },
      { status: 500 }
    );
  }
}