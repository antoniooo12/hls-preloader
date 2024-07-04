import {useEffect, useRef, useState} from "react";
import {MOCK_VIDEOS} from "./MOCK_VIDEOS.ts";
import Hls from "hls.js";

// preload videos
function preloadNextVideo(src): Promise<Hls> {
    // configured to load only 5 seconds of video / 1 chunk
   return new Promise((resolve, reject) => {
       const nextVideoHls = new Hls({debug: true, maxBufferLength: 5, maxBufferSize: 800});
       nextVideoHls.loadSource(src);
       const video = document.createElement('video')
       video.pause()
       nextVideoHls.attachMedia(video); // Create a new video element but don't add to DOM
       nextVideoHls.on(Hls.Events.MANIFEST_PARSED, function () {
              resolve(nextVideoHls);
       });
   })
    // maybe it's better to detach media when video here

}


const links = MOCK_VIDEOS.map(m => `https://stream.mux.com/${m.mux}.m3u8`);
export const AppV4 = () => {

    const videoRef = useRef<HTMLVideoElement>(null);

    const [instances, setInstances] = useState<Hls[]>([]);
    useEffect(() => {
     const timeout =   setTimeout(()=>{
            // preload all videos
            const load = async () => {
                for (const link of links) {
                    const hls = await preloadNextVideo(link);
                    setInstances(prevState => [...prevState, hls]);
                }
            }
            load();
        },2000)
        return () => {
            clearTimeout(timeout);
        }
    }, []);


    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const setCurrentVideo = (index: number) => {
        // change hls instance
        // browser will cache the first chunk of the video

        // detach current video
        const prevHls = instances[currentVideoIndex];
        prevHls.detachMedia();
        setCurrentVideoIndex(index);

        // attach new video with cached first chunk
        const selectedHls = instances[index];
        selectedHls.detachMedia()
        selectedHls.attachMedia(videoRef.current!);
        videoRef.current.pause();
        videoRef.current.currentTime = 0.01;
        videoRef.current.play();
    }
    const onEnded = () => {
        const nextIndex = currentVideoIndex + 1;
        if (nextIndex < links.length) {
            setCurrentVideo(nextIndex);
        }
    }

    return (
        <div>
            <video
                onEnded={onEnded}
                ref={videoRef} controls autoPlay style={{width: 300, height: 300}}/>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10
            }}>
                {links.map((link, index) => (
                    <button className="animated-button" key={index} onClick={() => setCurrentVideo(index)}>
                        Video {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );

};
