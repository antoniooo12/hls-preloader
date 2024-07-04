import {MOCK_VIDEOS} from "./MOCK_VIDEOS.ts";

class Preloader {
    constructor() {
        this.tasks = {};
    }

    async addTask(url) {
        if (!this.tasks[url]) {
            this.tasks[url] = this.fetchFirstChunk(url);
        }
        return this.tasks[url];
    }

    async fetchFirstChunk(url) {
        const response = await fetch(url, {
            headers: {
                Range: 'bytes=0-999999', // Adjust range as necessary
            },
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    stopAll() {
        Object.keys(this.tasks).forEach((url) => {
            delete this.tasks[url];
        });
    }
}

export const preloader = new Preloader();

import React, { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    console.log('src: ', src)

    useEffect(() => {
        if (src && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current.play();
            });

            return () => {
                hls.destroy();
            };
        } else if (src && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = src;
            videoRef.current.addEventListener('loadedmetadata', () => {
                videoRef.current.play();
            });
        }
    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            style={{ width: '300px', height: '300px' }}
        ></video>
    );
};



const App = () => {
    const videoUrls = MOCK_VIDEOS.map((video) => `https://stream.mux.com/${video.mux}.m3u8`);

    const [videoBlobs, setVideoBlobs] = useState<string[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    useEffect(() => {
        const preloadVideos = async () => {
            const blobs = [];
            for (const url of videoUrls) {
                const blob = await preloader.addTask(url);
                console.log('blob: ', blob)
                blobs.push(blob);
            }
            setVideoBlobs(blobs);
        };

        preloadVideos();
        return () => {
            preloader.stopAll();
        };
    }, []);

    const currentVideoSrc =  videoBlobs[currentVideoIndex];

    const nextVideo = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoBlobs.length);
    }
    const previousVideo = () => {
        setCurrentVideoIndex((prev) => (prev - 1 + videoBlobs.length) % videoBlobs.length);
    }

    return (
        <div>
            <h1>Video Player</h1>
            <div>
                <button onClick={nextVideo}>Next</button>
                <button onClick={previousVideo}>Previous</button>
            </div>
            {currentVideoSrc && <VideoPlayer src={currentVideoSrc}/>}
        </div>
    );
};

export default App;
