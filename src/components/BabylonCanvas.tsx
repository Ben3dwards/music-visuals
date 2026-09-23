import { useEffect, useRef } from "react";
import{Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3} from "@babylonjs/core"

export default function BabylonCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 5, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        new HemisphericLight("light", new Vector3 (0, 1, 0), scene);

        MeshBuilder.CreateBox("cube", {size: 1}, scene);

        engine.runRenderLoop(() => scene.render());

        const onResize = () => engine.resize();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            engine.dispose();
        };

    }, []);

    return <canvas ref={canvasRef} className="block h-full w-full" />;
}