import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';

export default function AudioPlayerSection({ data, id = 'audioplayersection' }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);
    const audioRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, []);

    // Reset audio when page/data changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Stop and reset audio
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setShowMiniPlayer(false);
    }, [data]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
            // Show mini player when they first press play
            setShowMiniPlayer(true);
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div id={id} className={clsx('rounded-3xl border-2 border-primary-6 transition-colors duration-300 md:w-[29.296rem] md:h-[26.05rem] lg:w-[32.5rem] lg:h-[29.291rem]', {
            'bg-primary-4': isPlaying,
            'bg-primary-3': !isPlaying,
        })}>
            <audio
                ref={audioRef}
                src={data.audioPlayer.audioFile}
                preload="metadata"
            />

            {/* Image Section */}
            <div className='p-4 rounded-t-3xl'>
                <div
                  className={`w-[21.44rem] h-[14.29rem] md:w-[26.79rem] md:h-[17.86rem] lg:min-w-[29.5rem] lg:min-h-[19.66rem] rounded-xl border-primary-6 border-2 transition-transform duration-300 ${isPlaying ? 'scale-102' : 'scale-100'}`}
                    style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage.horizontal}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </div>

            {/* Audio Controls */}
            <div
                ref={controlsRef}
                id="audio-controls-section"
                className={`p-4 mx-auto rounded-b-3xl transition-all duration-300 ${isPlaying ? 'pb-6' : 'pb-4'}`}
            >
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-row justify-between items-start space-x-2">
                        <button
                            onClick={togglePlayPause}
                            className="w-14 h-14 md:w-13 md:h-13 lg:w-18 lg:h-18 hover:bg-[#592411] active:bg-[#341A11] bg-primary-4 border-2 border-primary-6 hover:border-[#80412B] active:shadow-none active:border-1 rounded-2xl flex items-center justify-center hover:bg-primary-5 transition-colors hover:cursor-pointer"
                        >
                            {isPlaying ? (
                                // Pause icon
                                <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="9" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                // Play icon
                                <svg width="20" height="22" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 3.65626C1 2.6851 1 2.19951 1.20249 1.93184C1.37889 1.69865 1.64852 1.55435 1.9404 1.53693C2.27544 1.51692 2.67946 1.78627 3.48752 2.32498L14.0031 9.33535C14.6708 9.78048 15.0046 10.003 15.1209 10.2836C15.2227 10.5288 15.2227 10.8044 15.1209 11.0497C15.0046 11.3302 14.6708 11.5528 14.0031 11.9979L3.48752 19.0083C2.67946 19.547 2.27544 19.8163 1.9404 19.7963C1.64852 19.7789 1.37889 19.6346 1.20249 19.4014C1 19.1337 1 18.6482 1 17.677V3.65626Z" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                        <div className="mt-1 ml-2">
                            <p className="text-primary-12 font-martel-sans font-semibold lg:text-[1.6875rem] lg:leading-[2.25rem] uppercase">{data.audioPlayer.chapterName}</p>
                            <p className="mt-1 text-primary-11 font-poppins font-normal text-[12px]">{data.audioPlayer.subtitle}</p>
                        </div>
                    </div>
                    <div className='bg-primary-10 rounded-3xl px-3 py-0.5 mr-3 mt-1.5 transition-all duration-300 ease-in-out overflow-hidden relative inline-block'>
                        <div className='relative whitespace-nowrap'>
                            {/* Duration text (in flow when paused, determines smaller width) */}
                            <span
                                className={`text-primary-12 font-poppins font-[500] text-[12px] py-1.0 px-1.0 mt-0.5 inline-block ${!isPlaying ? '' : 'absolute opacity-0'}`}
                            >
                                {formatTime(duration)}
                            </span>
                            {/* Playing text (in flow when playing, determines larger width) */}
                            <span
                                className={`text-primary-12 font-poppins font-[500] text-[12px] py-1.0 px-1.0 mt-0.5 inline-block ${isPlaying ? '' : 'absolute opacity-0'}`}
                            >
                                {formatTime(currentTime)} | {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Audio Player - Show once play button is clicked */}
            {showMiniPlayer && (
                <div className='fixed bottom-0 left-0 right-0 w-full z-[999]'>
                    <div className='max-w-7xl mx-auto w-full p-3'>
                        <div className={`border-2 border-primary-6 p-2 shadow-lg w-72 rounded-2xl ${isPlaying ? 'bg-primary-4' : 'bg-primary-3'}`}>
                            <div className="flex flex-row justify-between items-center max-w-screen-xl mx-auto">
                                <div className="flex flex-row items-center space-x-2">
                                    <button
                                        onClick={togglePlayPause}
                                        className="w-14 h-14 bg-primary-4 border-2 border-primary-6 rounded-2xl flex items-center justify-center hover:bg-primary-5 transition-colors hover:cursor-pointer"
                                    >
                                        {isPlaying ? (
                                            // Pause icon
                                            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="1" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <rect x="9" y="1" width="4" height="16" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            // Play icon
                                            <svg width="20" height="22" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 3.65626C1 2.6851 1 2.19951 1.20249 1.93184C1.37889 1.69865 1.64852 1.55435 1.9404 1.53693C2.27544 1.51692 2.67946 1.78627 3.48752 2.32498L14.0031 9.33535C14.6708 9.78048 15.0046 10.003 15.1209 10.2836C15.2227 10.5288 15.2227 10.8044 15.1209 11.0497C15.0046 11.3302 14.6708 11.5528 14.0031 11.9979L3.48752 19.0083C2.67946 19.547 2.27544 19.8163 1.9404 19.7963C1.64852 19.7789 1.37889 19.6346 1.20249 19.4014C1 19.1337 1 18.6482 1 17.677V3.65626Z" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                    <div>
                                        <p className="text-primary-12 font-martel-sans font-semibold text-[16px] uppercase">{data.audioPlayer.chapterName}</p>
                                        <p className="text-primary-11 font-poppins font-normal text-[11px]">{data.audioPlayer.subtitle}</p>
                                    </div>
                                </div>
                                <div className='bg-primary-10 rounded-3xl px-3 py-0.5 transition-all duration-300 ease-in-out overflow-hidden relative inline-block'>
                                    <div className='relative whitespace-nowrap'>
                                        {/* Duration text (in flow when paused, determines smaller width) */}
                                        <span
                                            className={`text-primary-12 font-poppins font-[500] text-[12px] py-1.0 px-1.0 inline-block ${!isPlaying ? '' : 'absolute opacity-0'}`}
                                        >
                                            {formatTime(duration)}
                                        </span>
                                        {/* Playing text (in flow when playing, determines larger width) */}
                                        <span
                                            className={`text-primary-12 font-poppins font-[500] text-[12px] py-1.0 px-1.0 inline-block ${isPlaying ? '' : 'absolute opacity-0'}`}
                                        >
                                            {formatTime(currentTime)} | {formatTime(duration)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
