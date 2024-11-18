import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const songsDir = path.join(process.cwd(), "public", "songs");
    const files = await fs.readdir(songsDir);

    const songs = files
      .filter((file) => file.endsWith(".mp3"))
      .map((file) => ({
        title: file.replace(".mp3", ""),
        src: `/songs/${file}`,
      }));

    return NextResponse.json(songs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load songs" },
      { status: 500 }
    );
  }
}
