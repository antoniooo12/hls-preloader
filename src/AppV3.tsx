import React, {useState, useEffect, useRef} from 'react';
import ReactPlayer from 'react-player';
import {MOCK_VIDEOS} from "./MOCK_VIDEOS.ts";
import ReactHlsPlayer from "react-hls-player";
import Hls from "hls.js";

interface VideoPlayerProps {
    videoLinks: string[]; // Array of video URLs
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({videoLinks}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaSources = useRef<(MediaSource | null)[]>([]);
    const sourceBuffers = useRef<(SourceBuffer | null)[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const preloadVideoChunk = async (videoUrl: string, index: number) => {
        // Create MediaSource for each video
        const mediaSource = new MediaSource();
        mediaSources.current[index] = mediaSource;
        mediaSource.addEventListener('sourceopen', async () => {
            const response = await fetch(videoUrl);
            const data = await response.text();
            const lines = data.split('\n').filter(line => line && !line.startsWith('#'));

            if (lines.length === 0) return;

            const segmentUrl = new URL(lines[0], videoUrl).toString();
            const segmentResponse = await fetch(segmentUrl);
            const segmentBlob = await segmentResponse.blob();
            const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
            sourceBuffers.current[index] = sourceBuffer;

            const segmentArrayBuffer = await segmentBlob.arrayBuffer();
            sourceBuffer.appendBuffer(segmentArrayBuffer);

            sourceBuffer.addEventListener('updateend', () => {
                if (index === currentVideoIndex) {
                    videoRef.current.src = URL.createObjectURL(mediaSources.current[index]);
                }
            });
        });
    };

    useEffect(() => {
        videoLinks.forEach((link, index) => preloadVideoChunk(link, index));
    }, [videoLinks]);


    const handleVideoSwitch = (index: number) => {
        setCurrentVideoIndex(index);
        if (mediaSources.current[index]) {
            videoRef.current.src = URL.createObjectURL(mediaSources.current[index]);
            videoRef.current.play().catch(e => console.error('Error playing video:', e));
        }
    };

    return (
        <div>
            <video ref={videoRef} controls autoPlay style={{width: '100%'}}/>
            <div>
                {videoLinks.map((link, index) => (
                    <button key={index} onClick={() => handleVideoSwitch(index)}>
                        Video {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

const videoLinks = MOCK_VIDEOS.map(m => `https://stream.mux.com/${m.mux}.m3u8`)
export const AppV3 = () => {
    const [players, setHls] = useState<Hls[]>([])

    useEffect(() => {
        const load = async () => {
            videoLinks.forEach((link, index) => {
                const hls = new Hls();
                hls.loadSource(link);
                hls.startLoad(0)
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play();
                });
                setHls(prevState => [...prevState, hls])
            })
        }
        load()
    }, [])

    return <></>;
}
