import { useEffect, useRef } from "react";
import{ Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Color4, ImportMeshAsync, TransformNode } from "@babylonjs/core";
import { audio } from "../audio/audioAnalyser";
import { createSmoke } from "../scene/smoke";
import "@babylonjs/loaders/glTF";

export default function BabylonCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect (() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 2, 5, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        //cube off
        //const cube = MeshBuilder.CreateBox("cube", { size: 1 }, scene);
        //const material = new StandardMaterial("cubeMaterial", scene);
        //cube.material = material;

        //cube.enableEdgesRendering();
        //cube.edgesWidth = 2;
        //cube.edgesColor = new Color4(0, 0, 0, 1);

        const pivot = new TransformNode("pivot", scene);

        ImportMeshAsync("/models/mr._burns_body.glb", scene).then((result)=>{
            if (scene.isDisposed) return;
            const model = result.meshes[0];
            model.normalizeToUnitCube();
            model.parent = pivot;
        });

        const smoke = createSmoke(scene);

        engine.runRenderLoop(() => {
            const bands = audio.getBands();
            const { subBass, midBass, mid, high } = bands;
            
            //stretch cube along different axis
            pivot.scaling.x = 1 + midBass * 15;
            pivot.scaling.y = 1 + mid * 13;
            pivot.scaling.z = 1 + high * 11;

            //Glow on bass
            //material.emissiveColor = new Color3(0.2 + midBass * 0.8, 0, 0.1 + midBass * 0.4);

            //Spin, speeds up when theres subBass
            //pivot.rotation.y += 0 + subBass * 0.03;
            //pivot.rotation.z += 0 + subBass * 0.03;

            smoke.update(bands)

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