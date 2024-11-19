import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-static";
export const revalidate = false;

async function getSongs() {
  const songsDir = path.join(process.cwd(), "public", "songs");
  const files = await fs.readdir(songsDir);

  return files
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => ({
      title: file.replace(".mp3", ""),
      src: `/songs/${file}`,
    }));
}

export async function GET() {
  try {
    const songs = await getSongs();
    return NextResponse.json(songs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load songs" },
      { status: 500 }
    );
  }
}
