"use client";

import React from "react";
import { FaStepBackward, FaPlay, FaPause, FaStepForward } from "react-icons/fa";

interface MediaControlsProps {
  isPlaying: boolean;
  playSong: () => void;
  pauseSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  playSong,
  pauseSong,
  nextSong,
  previousSong,
}) => {
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-4">
      <button onClick={previousSong} className="p-2 rounded">
        <FaStepBackward color="white" />
      </button>
      <button onClick={togglePlayPause} className="p-2 rounded">
        {isPlaying ? <FaPause color="white" /> : <FaPlay color="white" />}
      </button>
      <button onClick={nextSong} className="p-2 rounded">
        <FaStepForward color="white" />
      </button>
    </div>
  );
};
