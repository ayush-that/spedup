"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MediaControls } from "@/components/MediaControls";

export default function Home() {
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [songs, setSongs] = useState<{ title: string; src: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [songHistory, setSongHistory] = useState<number[]>([]);

  const nextRandomSongRef = useRef<() => void>();

  const handleSongEnd = useCallback(() => {
    if (nextRandomSongRef.current) {
      nextRandomSongRef.current();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    audio.addEventListener("ended", handleSongEnd);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, [handleSongEnd]);

  const changeSong = useCallback(
    async (newIndex: number, addToHistory: boolean = true) => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current.load();
          audioRef.current.removeEventListener("ended", handleSongEnd);
        }

        if (addToHistory) {
          setSongHistory((prevHistory) => [...prevHistory, currentSong]);
        }

        if (songs[newIndex]) {
          const newAudio = new Audio(songs[newIndex].src);
          newAudio.volume = volume;
          newAudio.addEventListener("ended", handleSongEnd);

          audioRef.current = newAudio;
          setCurrentSong(newIndex);

          await newAudio.play();
          setIsPlaying(true);
          setHasStarted(true);
        }
      } catch (error) {
        console.error("Error changing song:", error);
      }
    },
    [currentSong, songs, volume, handleSongEnd]
  );

  const nextRandomSong = useCallback(() => {
    if (songs.length > 0) {
      const nextSongIndex = getRandomIndex(songs.length);
      changeSong(nextSongIndex);
    }
  }, [songs.length, changeSong]);

  useEffect(() => {
    nextRandomSongRef.current = nextRandomSong;
  }, [nextRandomSong]);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current && songs.length > 0) {
      await changeSong(currentSong);
      return;
    }

    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasStarted(true);
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  }, [isPlaying, songs.length, changeSong, currentSong]);

  const previousSong = useCallback(() => {
    setSongHistory((prevHistory) => {
      if (prevHistory.length > 0) {
        const lastSongIndex = prevHistory[prevHistory.length - 1];
        changeSong(lastSongIndex, false);
        return prevHistory.slice(0, -1);
      }
      return prevHistory;
    });
  }, [changeSong]);

  const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

  const nextRandomSongCallback = useCallback(() => {
    if (songs.length > 0) {
      const nextSongIndex = getRandomIndex(songs.length);
      changeSong(nextSongIndex);
    }
  }, [songs.length, changeSong]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight" && !e.repeat) {
        e.preventDefault();
        nextRandomSongCallback();
      } else if (e.code === "ArrowLeft" && !e.repeat) {
        e.preventDefault();
        previousSong();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [togglePlayPause, nextRandomSongCallback, previousSong]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current.removeEventListener("ended", handleSongEnd);
      }
    };
  }, [handleSongEnd]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/api/songs");
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
      >
        <source src="/videos/anime-visuals.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 p-4">
        <h2 className="text-white pb-9 text-lg font-thin">
          {!hasStarted
            ? "Press space to play"
            : isBuffering
            ? "Buffering..."
            : songs[currentSong]?.title}
        </h2>
        <MediaControls
          isPlaying={isPlaying}
          playSong={togglePlayPause}
          pauseSong={togglePlayPause}
          nextSong={nextRandomSong}
          previousSong={previousSong}
          isBuffering={isBuffering}
          hasStarted={hasStarted}
          currentSong={currentSong}
          songs={songs}
          className="retro-glow"
        />
      </div>
    </div>
  );
}
