import { audio, type Bands } from "./audioAnalyser";
import { createHitDetector } from "./hitDetector";

export type AudioFeatures = {
    bands: Bands;
    kick: boolean;
    snare: boolean;
    kickPulse: number;
    snarePulse: number;
    spectrum: Uint8Array;
}

const DETECTION = {
    kick: { margin: 0.08, cooldown: 6 },
    snare: { margin: 0.07, cooldown: 12 },
    pulseDecay: 0.85,
};

export function createAudioFeatures(){
    const isKick = createHitDetector(DETECTION.kick.margin, DETECTION.kick.cooldown);
    const isSnare = createHitDetector(DETECTION.snare.margin, DETECTION.snare.cooldown);
    let kickPulse = 0;
    let snarePulse = 0;

    return{
        update(): AudioFeatures{
            const bands = audio.getBands();
            const kick = isKick(bands.midBass);
            const snare = isSnare(bands.snare);

            kickPulse = kick ? 1 : kickPulse * DETECTION.pulseDecay;
            snarePulse = snare ? 1 : snarePulse * DETECTION.pulseDecay;

            return{ bands, kick, snare, kickPulse, snarePulse, spectrum: audio.spectrum };
        },
    };
}