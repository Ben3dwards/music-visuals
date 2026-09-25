import { useEffect, useRef } from "react";
import{Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3 } from "@babylonjs/core"

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

        const cube = MeshBuilder.CreateBox("cube", {size: 1}, scene);

        const material = new StandardMaterial ("cubeMaterial", scene);
        material.diffuseColor = new Color3(1, 0, 0.5);
        cube.material = material;

        engine.runRenderLoop(() => { 
            cube.rotation.y += 0.01
            cube.rotation.x += 0.01
            scene.render()
        });

        const onResize = () => engine.resize();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            engine.dispose();
        };

    }, []);

    return <canvas ref={canvasRef} className="block h-full w-full" />;
}