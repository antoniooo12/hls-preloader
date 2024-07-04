import {useEffect, useState} from 'react'
import axios from "axios";
import {Player} from "./Player.tsx";
import {MOCK_VIDEOS} from "./MOCK_VIDEOS.ts";
import {VideoPreloader} from "./VideoPreloade.ts";

async function getFirstSegment(manifestUrl: string) {
    try {
        // Fetch the HLS manifest
        const response = await axios.get(manifestUrl);
        const manifest = response.data;

        // Parse the manifest to get the first segment URL
        const lines = manifest.split('\n');
        let segmentPath = null;
        for (const line of lines) {
            if (line && !line.startsWith('#')) {
                segmentPath = line;
                break;
            }
        }

        if (!segmentPath) {
            throw new Error('No segment found in the manifest.');
        }

        // Handle relative URLs
        const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/') + 1);
        const segmentUrl = segmentPath.startsWith('http') ? segmentPath : baseUrl + segmentPath;
        // Fetch the first segment
        const chunk = 'https://chunk-gcp-us-east4-vop1.cfcdn.mux.com/v1/chunk/rfix0102V1rEtsRLjrIFoBo7DuakD59LO2i1yr5zXQCLK84DJcov9YKA5Hi9omiolY01LnhzJBmhE444iAETCYSrBu9GWunZS9q/0.ts?skid=default&signature=NjY5MDAxODBfOWQ3ZjZkOTAyMzkyNGI0MDE2MTFhZGMzNmEwM2UwZmEwZjA2Y2Q3NzliYTAyMGU4Mzg0ZjBmYTE4ZTQwZDQzMA==&zone=1&vsid=a6OOUUQo5bqupyCsNtg82hj02702uA7gfoleSr101Uv01kJpWdHG7zQYKjpsYgb31mMdXekp8UWCK4coodY7XK00c00qEEE7o2ujKnp6pLAwEKJ4AmmoWyvMBOBJLi02AvkMsJB&CMCD=br%3D2341%2Ccid%3D%224MgkASJ02O93YdzSzBsgcbYGYSrsRdICnhSOFoZBXGOM%22%2Cd%3D5000%2Cmtp%3D2300%2Cot%3Dav%2Csf%3Dh%2Csid%3D%22a7a0b720-9afa-4e33-8a13-0c3076f7e679%22%2Csu%2Ctb%3D2341'
        const segmentResponse: string = (await axios.get<string>(segmentUrl)).data as string;
        const regex = /#EXTINF:5,\s*(https?:\/\/[^\s]+)/;
        const firstChunkUrl = segmentResponse.match(regex);
        // const


        const firstChunk = await axios.get(chunk, {
            responseType: 'blob',
        });


        return firstChunk.data;
    } catch (error) {
        console.error('Error fetching the first segment:', error);
    }
}

const fetchVideoBlob = async (hlsUrl: string) => {
    const firstSegment = await getFirstSegment(hlsUrl);
    // const v1 ='https://manifest-gcp-us-east4-vop1.cfcdn.mux.com/4skkkla6F800nNWe8wO55ccyvHhs10200wXDEsY83xW02004KP9m00LtgSL00Bcl7SuR2vwf2ysRDFkNXySIwPtwu21ZdOc3S4bQsRw01xvkbLdAbk4/rendition.m3u8?cdn=cloudflare&expires=1720224000&skid=default&signature=NjY4ODg5MDBfMmU4YTE1NmJkMjUyNzZlYzAzODk2M2EyMzFlNjc4NWZlN2QzMDk4MmY5NWY4NmE5NDQyY2M4Njg1OTQzNThjMw==&vsid=Gyeut6HMl9tZ1stvL7J02uD9B8rOfukjjDF9xeGUk11Slqjs38oBX4gu1JimxoEPV7gptRCLEKmY'
    // const v2 ='https://chunk-gcp-us-east4-vop1.fastly.mux.com/v1/chunk/viid6qwi4qoHJuBAOls5RzFuAjEiHA02K3EhxwDAkl3DVAvHaQqeUruvU1MxLmPt4aEyeitwWA8dbrTcathm5fnkcx5c01ZKKo/0.ts?skid=default&signature=NjY5MDAxODBfNTkwNjk2NDA1MzYyNTJlMGZhYTIxNDlmMmU1Mzk1MzAzZTY1OWNjZGJjNjczOWQzZTA4Y2U1YTI2Y2QyOWY1YQ==&zone=1&vsid=Tmd1rkIbJmJrLsdMeZU4itfQ5PIF7nXDxDGP7yv005hobw00TuLtxMYjkpxSi8siPOfhJAim102RrPbR8CkxB2sfEDAfuQ02uG7te7lmVfvQu6w87CwVVdNz007a702uim02dr3'
 const response = await   fetch("https://chunk-gcp-us-east4-vop1.fastly.mux.com/v1/chunk/UyOA01jBeQgwNlQ01ymHULDW66FUpc2uhUSexIW5UyDSKKu8O02SlY00Lvz9U69Z101j2zsd6Cx00lmFbsd9XQiyFCjzpDx4f02xBu8/0.ts?skid=default&signature=NjY5MDAxODBfYWZlNmYzNjczZTMyYWQ4MDM4MDQ2MmMwYWM3OTRkNWZiNWU2YzQ1MmYyZmI0NWE3ODJiZmQyNGM3NGY0MWNiMQ==&zone=0&vsid=l02bwJpnStibhyozNJT2KsHAK006k5KhUW02mJitB2mgpn3EyuLUsMc00K8kHCnN5fq7RE016TQe88oYbqKsKztvKJl8N3Qq5WHt4io4wVGC4Oxikrs6C8owcqKQKjF9hy800q&CMCD=br%3D2341%2Ccid%3D%22p00ClGqy9Gy015QlrJULSTcAkeYbllK6CBc8kuLICoLzg%22%2Cd%3D5000%2Cmtp%3D2300%2Cot%3Dav%2Csf%3Dh%2Csid%3D%2200e04e8f-2343-4965-b348-94e780204a26%22%2Csu%2Ctb%3D2341", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,uk;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        },
        "referrer": "https://harvoola.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    });
    // const response = await fetch(v2);
    const blob = await response.blob();
    return  URL.createObjectURL(blob);
};

const getHLSUrl = async (muxId: string) => {
    const response = await axios.get(`https://stream.mux.com/${muxId}.m3u8`);
    return response.data;
}




function App() {
    // store blob links
    const [preloadedBlobs, setPreloadedBlobs] = useState<string[]>([]);

    useEffect(() => {
        const preloadBlob = async () => {
            const muxId = MOCK_VIDEOS[0].mux;
            const muxLink = `https://stream.mux.com/${muxId}.m3u8`
            const blobLink = await fetchVideoBlob(muxLink);
            setPreloadedBlobs(prevState => [...prevState, blobLink]);
        };
       void preloadBlob();
    }, []);


    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const currentVideo = preloadedBlobs[currentVideoIndex];

    return (
        <div>
            <div>
                <button>
                    next
                </button>
                <button>
                    previous
                </button>
            </div>
            {currentVideo && <Player blobUrl='https://stream.mux.com/oT66No1xWwbydQInNqWiKCUgpWTIGgEwoUn92t3cq6U.m3u8'    />}
        </div>
    )
}

export default App
