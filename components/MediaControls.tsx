import React from "react";
import {
  MdSkipPrevious,
  MdPlayArrow,
  MdPause,
  MdSkipNext,
} from "react-icons/md";

export interface MediaControlsProps {
  isPlaying: boolean;
  playSong: () => Promise<void>;
  pauseSong: () => Promise<void>;
  nextSong: () => void;
  previousSong: () => void;
  isBuffering: boolean;
  hasStarted: boolean;
  currentSong: number;
  songs: { title: string; src: string }[];
  className?: string;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  playSong,
  pauseSong,
  nextSong,
  previousSong,
  isBuffering,
  hasStarted,
  currentSong,
  songs,
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
    <div className={className}>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={previousSong}
          className="focus:outline-none bg-transparent"
        >
          <MdSkipPrevious className="text-white" size={30} />
        </button>
        <button
          onClick={togglePlayPause}
          className="focus:outline-none bg-transparent"
        >
          {isPlaying ? (
            <MdPause className="text-white" size={30} />
          ) : (
            <MdPlayArrow className="text-white" size={30} />
          )}
        </button>
        <button
          onClick={nextSong}
          className="focus:outline-none bg-transparent"
        >
          <MdSkipNext className="text-white" size={30} />
        </button>
      </div>
    </div>
  );
};
