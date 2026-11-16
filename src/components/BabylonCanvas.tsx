import { useEffect, useRef } from "react";
import{ Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Color4 } from "@babylonjs/core";
import { audio } from "../audio/audioAnalyser";

export default function BabylonCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect (() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 2, 5, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        const cube = MeshBuilder.CreateBox("cube", { size: 1 }, scene);
        const material = new StandardMaterial("cubeMaterial", scene);
        cube.material = material;

        cube.enableEdgesRendering();
        cube.edgesWidth = 2;
        cube.edgesColor = new Color4(0, 0, 0, 1);

        engine.runRenderLoop(() => {
            const { subBass, midBass, mid, high } = audio.getBands();
            
            //stretch cube along different axis
            cube.scaling.x = 1 + midBass * 1.5;
            cube.scaling.y = 1 + mid * 1.5;
            cube.scaling.z = 1 + high * 3;

            //Glow on bass
            material.emissiveColor = new Color3(0.2 + midBass * 0.8, 0, 0.1 + midBass * 0.4);

            //Spin, speeds up when theres subBass
            cube.rotation.y += 0 + subBass * 0.03;
            cube.rotation.z += 0 + subBass * 0.03;

            scene.render();
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