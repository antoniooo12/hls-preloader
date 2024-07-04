export class VideoPreloader {
    videoChunks: Map<string, string>;
    controllers: Map<string, AbortController>;
    constructor() {
        this.videoChunks = new Map();
        this.controllers = new Map();
    }

    async preloadVideo(url) {
        if (this.videoChunks.has(url)) {
            return this.videoChunks.get(url);
        }

        const controller = new AbortController();
        this.controllers.set(url, controller);

        try {
            const response = await fetch(url, { signal: controller.signal });
            const reader = response.body.getReader();
            const { value } = await reader.read();

            const blob = new Blob([value], { type: 'video/mp4' });
            this.videoChunks.set(url, URL.createObjectURL(blob));

            return URL.createObjectURL(blob);
        } catch (err) {
            console.error('Failed to preload video chunk:', err);
        }
    }

    stopPreloading(url) {
        if (this.controllers.has(url)) {
            this.controllers.get(url).abort();
            this.controllers.delete(url);
        }
    }

    getBlobUrl(url) {
        return this.videoChunks.get(url);
    }
}
