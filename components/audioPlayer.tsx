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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    random(tracks.length - 1)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Volume state
  const audioRef = useRef(
    new Audio(`/audio/${tracks[currentTrackIndex]}.opus`)
  );

  useEffect(() => {
    const audio = audioRef.current;

    // Changer la source et jouer automatiquement
    audio.src = `/audio/${tracks[currentTrackIndex]}.opus`;
    if (isPlaying) {
      audio.play();
    }

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
    audio.volume = volume; // Met à jour le volume sans redémarrer la musique
  }, [volume]); // Met à jour le volume quand il change

  const playPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true); // Joue automatiquement la prochaine piste
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true); // Joue automatiquement la piste précédente
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

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
