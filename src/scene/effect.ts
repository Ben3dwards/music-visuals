import type { AudioFeatures } from "../audio/audioFeatures";
import type { VisualSettings } from "./settings";

//Shape every visual effect follows
export type Effect = {
    //react to user settings
    apply(settings: VisualSettings): void;
    //react to music
    update?(features: AudioFeatures): void;

    dispose(): void;
}