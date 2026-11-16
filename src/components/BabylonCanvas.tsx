import { useEffect, useRef } from "react";
import { createVisualiser, type Visualisor } from "../scene/visualiser";
import type { VisualSettings } from "../scene/settings";

type Props = {
    settings: VisualSettings;
};

export default function BabylonCanvas({ settings }: Props){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualiserRef = useRef<Visualisor | null>(null);

    //create the visualiser once
    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;

        const visualiser = createVisualiser(canvas);
        visualiserRef.current = visualiser;

        return () => {
            visualiser.dispose();
            visualiserRef.current = null;
        };
    }, []);

    //when settings change, pass on
    useEffect(() => {
        visualiserRef.current?.applySettings(settings);
    }, [settings]);

    return <canvas ref={canvasRef} className="block h-full w-full" />;
}