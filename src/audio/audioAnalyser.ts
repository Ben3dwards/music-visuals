export type Bands = { subBass: number;  midBass: number; snareBody: number; snare: number; mid: number; high: number };

class AudioAnalyser {
    private ctx: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private stream: MediaStream | null = null;
    private data = new Uint8Array(0);

    async startSystemAudio(onEnded?: () => void){
        this.stop(); //cleanup

        const options = { video: true, audio: true, systemAudio: "include" as const };
        const stream = await navigator.mediaDevices.getDisplayMedia(options);

        stream.getVideoTracks().forEach((t) => t.stop());

        if (stream.getAudioTracks().length === 0){
            throw new Error (
                "No audio was shared. On Windows, share your entire screen and tick 'Also share system audio'. " +
                "On a Mac, update Chrome and macOS, or share a Chrome tab that's playing music.",
            )
        }

        this.ctx = new AudioContext();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.4;

        this.ctx.createMediaStreamSource(stream).connect(this.analyser);
        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        this.stream = stream;

        stream.getAudioTracks()[0].addEventListener("ended", () => {
            this.stop();
            onEnded?.();
        });
    }

    getBands(): Bands {
        if (!this.analyser) return { subBass: 0, midBass: 0, snareBody: 0, snare: 0, mid: 0, high: 0};
        this.analyser.getByteFrequencyData(this.data);
        return{
            subBass: this.average (20, 60),
            midBass: this.average(60, 150),
            mid: this.average(150, 2000),
            snareBody: this.average(150,250),
            snare: this.average (2000,4000),
            high: this.average(4000, 12000),
        };       
    }

    //the latest full frequency data. filled by getBands()
    get spectrum(): Uint8Array{
        return this.data;
    }
    
    stop() {
        this.stream?.getTracks().forEach((t) => t.stop());
        this.ctx?.close();
        this.ctx = null;
        this.analyser = null;
        this.stream = null;
    }

    //average loudness between two freqs
    private average(fromHz: number, toHz: number) {
        if (!this.analyser || !this.ctx) return 0;
        const hzPerBin = this.ctx.sampleRate / this.analyser.fftSize;
        const start = Math.max(1, Math.floor(fromHz / hzPerBin))
        const end = Math.min(this.data.length -1, Math.ceil(toHz / hzPerBin));
        let sum = 0;
        for (let i = start; i <= end; i++) sum += this.data[i];
        return sum / (end - start + 1) / 255
    }
}

export const audio = new AudioAnalyser();