import { audio, type Bands } from "./audioAnalyser";
import { createHitDetector } from "./hitDetector";

export type AudioFeatures = {
    bands: Bands;
    kick: boolean;
    snare: boolean;
    spectrum: Uint8Array;
}

const DETECTION = {
    kick: { margin: 0.08, cooldown: 6 },
    snare: { margin: 0.07, cooldown: 12 },
};

export function createAudioFeatures(){
    const isKick = createHitDetector(DETECTION.kick.margin, DETECTION.kick.cooldown);
    const isSnare = createHitDetector(DETECTION.snare.margin, DETECTION.snare.cooldown);

    return{
        update(): AudioFeatures{
            const bands = audio.getBands();

            return{
                bands,
                kick: isKick(bands.midBass),
                snare: isSnare(bands.snare),
                spectrum: audio.spectrum,
            };
        },
    };
}