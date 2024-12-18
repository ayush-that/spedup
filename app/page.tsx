"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MediaControls } from "@/components/MediaControls";
import { CloudWrapper } from "@/components/CloudWrapper";
import { MdGraphicEq } from "react-icons/md";

const VIDEO_PATHS = [
  "/videos/anime-visuals.mp4",
  "/videos/anime-visuals2.mp4",
] as const;

export default function Home() {
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [songs, setSongs] = useState<{ title: string; src: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [songHistory, setSongHistory] = useState<number[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleSongEndRef = useRef<() => void>();
  const handleWaitingRef = useRef<() => void>();
  const handlePlayingRef = useRef<() => void>();

  const nextRandomSongRef = useRef<() => void>();

  useEffect(() => {
    handleSongEndRef.current = () => {
      if (nextRandomSongRef.current) {
        nextRandomSongRef.current();
      }
    };

    handleWaitingRef.current = () => {
      setIsBuffering(true);
    };

    handlePlayingRef.current = () => {
      setIsBuffering(false);
    };
  }, []);

  const changeSong = useCallback(
    async (newIndex: number, addToHistory: boolean = true) => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          if (handleSongEndRef.current) {
            audioRef.current.removeEventListener(
              "ended",
              handleSongEndRef.current
            );
          }
          if (handleWaitingRef.current) {
            audioRef.current.removeEventListener(
              "waiting",
              handleWaitingRef.current
            );
          }
          if (handlePlayingRef.current) {
            audioRef.current.removeEventListener(
              "playing",
              handlePlayingRef.current
            );
          }
          audioRef.current.src = "";
          audioRef.current.load();
        }

        if (addToHistory) {
          setSongHistory((prevHistory) => [...prevHistory, currentSong]);
        }

        if (songs[newIndex]) {
          const newAudio = new Audio(songs[newIndex].src);
          newAudio.volume = volume;

          if (handleSongEndRef.current) {
            newAudio.addEventListener("ended", handleSongEndRef.current);
          }
          if (handleWaitingRef.current) {
            newAudio.addEventListener("waiting", handleWaitingRef.current);
          }
          if (handlePlayingRef.current) {
            newAudio.addEventListener("playing", handlePlayingRef.current);
          }

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
    [currentSong, songs, volume]
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

  const toggleVideo = useCallback(() => {
    setCurrentVideoIndex((current) => (current === 0 ? 1 : 0));
  }, []);

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
      } else if (e.code === "KeyG" && !e.repeat) {
        e.preventDefault();
        toggleVideo();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [togglePlayPause, nextRandomSongCallback, previousSong, toggleVideo]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        if (handleSongEndRef.current) {
          audioRef.current.removeEventListener(
            "ended",
            handleSongEndRef.current
          );
        }
        if (handleWaitingRef.current) {
          audioRef.current.removeEventListener(
            "waiting",
            handleWaitingRef.current
          );
        }
        if (handlePlayingRef.current) {
          audioRef.current.removeEventListener(
            "playing",
            handlePlayingRef.current
          );
        }
      }
    };
  }, []);

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
        key={VIDEO_PATHS[currentVideoIndex]} // Force remount on source change
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={VIDEO_PATHS[currentVideoIndex]} type="video/mp4" />
      </video>
      <div className="absolute top-0 w-full flex flex-col items-center p-4">
        <CloudWrapper>
          <h2 className="text-white pb-2 text-lg font-neon-glow font-thin text-center flex items-center justify-center">
            <MdGraphicEq className="icon-equalizer text-white mr-2" size={24} />
            {isBuffering
              ? "Buffering..."
              : songs[currentSong]?.title
              ? `${songs[currentSong].title}...`
              : "No song selected"} 
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
          />
        </CloudWrapper>
      </div>
    </div>
  );
}
