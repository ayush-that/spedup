"use client";

import { useState, useEffect } from "react";
import { MediaControls } from "@/components/MediaControls";

export default function Home() {
  const [currentSong, setCurrentSong] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [songs, setSongs] = useState<{ title: string; src: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs");
      const data = await response.json();
      setSongs(data);
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    if (songs.length > 0 && !audio) {
      const newAudio = new Audio(songs[currentSong]?.src);
      newAudio.volume = volume;

      const handleSongEnd = () => {
        nextRandomSong();
      };
      newAudio.addEventListener("ended", handleSongEnd);

      setAudio(newAudio);

      return () => {
        newAudio.removeEventListener("ended", handleSongEnd);
      };
    }
  }, [songs, audio, currentSong, volume]);

  const playSong = () => {
    audio?.play();
    setIsPlaying(true);
  };

  const pauseSong = () => {
    audio?.pause();
    setIsPlaying(false);
  };

  const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

  const changeSong = async (newIndex: number) => {
    try {
      if (audio) {
        await audio.pause();
        audio.src = "";
        audio.load();
      }

      if (songs[newIndex]) {
        const newAudio = new Audio(songs[newIndex].src);
        newAudio.volume = volume;

        const handleSongEnd = () => {
          console.log("Song ended, playing next...");
          nextRandomSong();
        };
        newAudio.addEventListener("ended", handleSongEnd);

        setAudio(newAudio);
        setCurrentSong(newIndex);

        try {
          await newAudio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error("Error changing song:", error);
    }
  };

  const nextRandomSong = () => {
    if (songs.length > 0) {
      const nextSongIndex = getRandomIndex(songs.length);
      changeSong(nextSongIndex);
    }
  };

  const previousSong = () => {
    if (songs.length > 0) {
      const previousSongIndex = (currentSong - 1 + songs.length) % songs.length;
      changeSong(previousSongIndex);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/anime-visuals.mp4" type="video/mp4" />
      </video>
      <div className="absolute bottom-0 left-0 p-4">
        <h2 className="text-white pb-9 text-lg font-thin">
          {songs[currentSong]?.title}...
        </h2>
        <MediaControls
          isPlaying={isPlaying}
          playSong={playSong}
          pauseSong={pauseSong}
          nextSong={nextRandomSong}
          previousSong={previousSong}
          className="retro-glow"
        />
      </div>
    </div>
  );
}
