"use client";
import { random } from "lodash";
import { useState, useEffect, useRef } from "react";

const tracks = [
  "Graveyard",
  "Life",
  "Lost Memories",
  "Midnight",
  "Nights & Fogs",
  "The Maze",
  "The World's End",
  "Tribe",
  "Wake Up",
];

export default function AudioPlayer() {
  const [proMode, setProMode] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    random(tracks.length - 1)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Volume state
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(`/audio/${tracks[currentTrackIndex]}.opus`);
      audioRef.current.volume = volume;
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    // Changer la source et jouer automatiquement
    audio.src = `/audio/${tracks[currentTrackIndex]}.opus`;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause(); // Stopper la lecture quand le composant est démonté
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex]); // Met à jour l'audio quand la piste change

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]); // Met à jour l'état de lecture quand il change

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume; // Met à jour le volume sans redémarrer la musique
  }, [volume]); // Met à jour le volume quand il change

  const playPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => {
      const newIndex = (prev + 1) % tracks.length;
      return newIndex;
    });
    setTimeout(() => setIsPlaying(true), 100); // Play the next track automatically with a slight delay
  };

  const prevTrack = () => {
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => {
      const newIndex = (prev - 1 + tracks.length) % tracks.length;
      return newIndex;
    });
    setTimeout(() => setIsPlaying(true), 100); // Play the previous track automatically with a slight delay
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  if (!proMode)
    return (
      <button
        className="bg-gray-800 text-white font-bold py-2 px-4 rounded border-2 border-gray-600 hover:bg-gray-700"
        onClick={() => setProMode(true)}
      >
        mode Pro
      </button>
    );

  return (
    <div>
      <p>Super Musique : {tracks[currentTrackIndex]}</p>
      <button onClick={prevTrack}>⏮</button>
      <button onClick={playPause}>{isPlaying ? "⏸" : "▶️"}</button>
      <button onClick={nextTrack}>⏭</button>
      <div>
        <label htmlFor="volume">Volume</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
}
