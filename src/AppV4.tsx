import {useEffect, useRef, useState} from "react";
import {MOCK_VIDEOS} from "./MOCK_VIDEOS.ts";
import Hls from "hls.js";

function preloadNextVideo(src) {
    const nextVideoHls = new Hls({debug: true, maxBufferLength: 5, maxBufferSize: 800});
    nextVideoHls.loadSource(src);
    const video = document.createElement('video')
    video.pause()
    nextVideoHls.attachMedia(video); // Create a new video element but don't add to DOM
    nextVideoHls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log('next video is ready to be played');
    });
    return nextVideoHls;
}

const links = MOCK_VIDEOS.map(m => `https://stream.mux.com/${m.mux}.m3u8`);
export const AppV4 = () => {

    const videoRef = useRef<HTMLVideoElement>(null);
    const [instances, setInstances] = useState<Hls[]>([]);
    useEffect(() => {
        const load = () => {
            links.map((link, index) => {
                const hls = preloadNextVideo(link);
                setInstances(prevState => [...prevState, hls]);
            })
        }
        load();
    }, []);


    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const setCurrentVideo = (index: number) => {

        const prevHls = instances[currentVideoIndex];
        prevHls.detachMedia();
        setCurrentVideoIndex(index);
        const selectedHls = instances[index];
        selectedHls.detachMedia()
        selectedHls.attachMedia(videoRef.current!);
        videoRef.current.pause();
        videoRef.current.currentTime = 0.01;
        videoRef.current.play();
    }

    return (
        <div>
            <video ref={videoRef} controls autoPlay style={{width: 300, height: 300}}/>
            {links.map((link, index) => (
                <button key={index} onClick={() => setCurrentVideo(index)}>
                    Video {index + 1}
                </button>
            ))}
        </div>
    );

};
