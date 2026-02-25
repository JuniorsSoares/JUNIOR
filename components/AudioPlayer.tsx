import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipForward, Music, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    playlist: string[];
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ playlist }) => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Se a playlist estiver vazia, não renderiza nada
    if (!playlist || playlist.length === 0) return null;

    const togglePlay = () => setIsPlaying(!isPlaying);

    const toggleMute = () => setIsMuted(!isMuted);

    const handleNext = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
        setIsPlaying(true);
    };

    const handleEnded = () => {
        handleNext();
    };

    return (
        <>
            {/* 
        O reprodutor do YouTube em si fica escondido
        Não precisamos exibir o vídeo, apenas tocar o áudio. 
      */}
            <div className="hidden">
                <ReactPlayer
                    url={playlist[currentTrackIndex]}
                    playing={isPlaying}
                    muted={isMuted}
                    controls={false}
                    onEnded={handleEnded}
                    width="0"
                    height="0"
                    // @ts-ignore - react-player type definitions are sometimes incomplete for playerVars
                    config={{
                        youtube: {
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                rel: 0,
                                showinfo: 0,
                                mute: 0,
                            }
                        }
                    }}
                />
            </div>

            <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg border border-slate-200/50 rounded-2xl p-3 flex items-center gap-3 transition-all hover:shadow-xl">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Music className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>

                <div className="flex flex-col min-w-[100px]">
                    <span className="text-xs font-bold text-slate-800">Música {currentTrackIndex + 1}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-nowrap">
                        {isPlaying ? 'Tocando' : 'Pausado'}
                    </span>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md shadow-indigo-600/20"
                        title={isPlaying ? "Pausar música" : "Tocar música"}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                        onClick={handleNext}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Próxima música"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                        onClick={toggleMute}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        title={isMuted ? "Ativar som" : "Desativar som"}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </>
    );
};
