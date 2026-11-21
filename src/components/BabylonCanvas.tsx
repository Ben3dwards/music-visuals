import { useEffect, useRef } from "react";
import { createVisualiser, type Visualiser } from "../scene/visualiser";
import type { VisualSettings } from "../scene/settings";

type Props = {
  settings: VisualSettings;
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
};

export default function BabylonCanvas({ settings, selectedId, onSelectObject }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualiserRef = useRef<Visualiser | null>(null);

  //always call the latest onSelectObject
    const onSelectRef = useRef(onSelectObject);
    useEffect(() => {
        onSelectRef.current = onSelectObject;
    }, [onSelectObject]);

  //Create the visualiser once, when the canvas appears
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const visualiser = createVisualiser(canvas, {
        onSelect: (id) => onSelectRef.current(id),
        });
        visualiserRef.current = visualiser;

        return () => {
        visualiser.dispose();
        visualiserRef.current = null;
        };
    }, []);

    //Pass settings and selection on whenever they change
    useEffect(() => {
        visualiserRef.current?.applySettings(settings);
    }, [settings]);

    useEffect(() => {
        visualiserRef.current?.select(selectedId);
    }, [selectedId]);

    return <canvas ref={canvasRef} className="block h-full w-full" />;
}