import { Scene, Color3, PhotoDome } from "@babylonjs/core";
import type { Effect } from "./effect";
import type { VisualSettings } from "./settings";

const SPIN_SPEED = 0.0005; //radians per frame at spin = 1

export function createBackground(scene: Scene): Effect{
    let dome: PhotoDome | null = null;
    let currentUrl: string | null = null;
    let spin = 0;

    function showImage(url: string){
        if (url === currentUrl) return;
        currentUrl = url;
        dome?.dispose();
        dome = new PhotoDome("backgroundDome", url, { resolution: 64, size: 1000 }, scene);
        dome.mesh.isPickable = false;
    }
    
    function hideImage(){
        dome?.dispose();
        dome = null;
        currentUrl = null;
    }

    return {
        apply({ background }: VisualSettings) {
            scene.clearColor = Color3.FromHexString(background.colour).toColor4(1);

            if (background.mode === "image") showImage(background.imageUrl);
            else hideImage();

            if (dome) dome.mesh.visibility = background.brightness;
            spin = background.spin;
        },

        update() {
            if (dome) dome.rotation.y += spin * SPIN_SPEED;
        },

        dispose(){
            hideImage();
        },
    };
}