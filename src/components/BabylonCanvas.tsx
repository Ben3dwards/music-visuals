import { useEffect, useRef } from "react";
import { createVisualiser, type Visualiser } from "../scene/visualiser";
import type { ObjectTransform, VisualSettings } from "../scene/settings";
import type { GizmoMode } from "../scene/gizmos";

type Props = {
  settings: VisualSettings;
  selectedId: string | null;
  gizmoMode: GizmoMode;
  editing: boolean;
  onSelectObject: (id: string | null) => void;
  onTransformEnd: (id: string, transform: ObjectTransform) => void;
};

export default function BabylonCanvas({ settings, selectedId, gizmoMode, editing, onSelectObject, onTransformEnd }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualiserRef = useRef<Visualiser | null>(null);

  //always call the latest onSelectObject
    const onSelectRef = useRef(onSelectObject);
    useEffect(() => {
        onSelectRef.current = onSelectObject;
    }, [onSelectObject]);

    const onTransformEndRef = useRef(onTransformEnd);
    useEffect(() => {
        onTransformEndRef.current = onTransformEnd;
    }, [onTransformEnd]);

  //Create the visualiser once, when the canvas appears
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const visualiser = createVisualiser(canvas, {
            onSelect: (id) => onSelectRef.current(id),
            onTransformEnd: (id, transform) => onTransformEndRef.current(id, transform),
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

    useEffect(() => {
        visualiserRef.current?.setGizmoMode(gizmoMode);
    }, [gizmoMode]);

    useEffect(() => {
        visualiserRef.current?.setEditing(editing);
    }, [editing]);

    return <canvas ref={canvasRef} className="block h-full w-full" />;
}