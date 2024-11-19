import React from "react";
import {
  MdSkipPrevious,
  MdPlayArrow,
  MdPause,
  MdSkipNext,
} from "react-icons/md";

interface MediaControlsProps {
  isPlaying: boolean;
  playSong: () => void;
  pauseSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  className?: string;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  playSong,
  pauseSong,
  nextSong,
  previousSong,
  className,
}) => {
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  };

  return (
    <div
      className={`absolute bottom-4 left-4 z-20 flex items-center space-x-4 ${className}`}
    >
      <button
        onClick={previousSong}
        className="focus:outline-none bg-transparent"
      >
        <MdSkipPrevious className="text-white retro-glow" size={24} />
      </button>
      <button
        onClick={togglePlayPause}
        className="focus:outline-none bg-transparent"
      >
        {isPlaying ? (
          <MdPause className="text-white retro-glow" size={30} />
        ) : (
          <MdPlayArrow className="text-white retro-glow" size={30} />
        )}
      </button>
      <button onClick={nextSong} className="focus:outline-none bg-transparent">
        <MdSkipNext className="text-white retro-glow" size={24} />
      </button>
    </div>
  );
};
