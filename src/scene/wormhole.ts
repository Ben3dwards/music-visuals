import { Scene, MeshBuilder, ShaderMaterial, Color3, Mesh, PostProcess, Texture, Effect as BabylonEffect, type Camera } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { createRandom } from "./random";
import { readReaction, type Reaction } from "./reactions";
import type { VisualSettings } from "./settings";

const TUBE = { length: 400, radius: 8, around: 64, along: 100 };
const MAX_SPEED_BOOST = 4; 

const PALETTES: [string, string][] = [
    ["#ff0080", "#00e5ff"],
    ["#7c3aed", "#f59e0b"],
    ["#22d3ee", "#a3e635"],
    ["#f43f5e", "#1e1b4b"],
    ["#ffffff", "#3b0764"],
    ["#fb923c", "#0ea5e9"],
];

//Very AI heavy!
// ---------- Shaders (GLSL: the graphics card's language) ----------
/** Runs once per corner of the tube: makes the tunnel snake about gently. */
const VERTEX = `
    precision highp float;

    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 worldViewProjection;
    uniform float time;
    uniform float wobble;

    varying vec2 vUV;
    varying float vAlong;

    void main() {
        vec3 p = position;

        // Bend the tube sideways in slow waves, so it's not a straight pipe
        p.x += sin(p.y * 0.02 + time * 0.3) * wobble;
        p.z += cos(p.y * 0.017 + time * 0.25) * wobble;

        vUV = uv;
        vAlong = p.y; // how far along the tube this point is (0 = the middle)
        gl_Position = worldViewProjection * vec4(p, 1.0);
    }
`;

/** Runs once per pixel: draws the moving, twisting pattern on the walls. */
const FRAGMENT = `
    precision highp float;

    varying vec2 vUV;
    varying float vAlong;

    uniform float travel;     // how far we've flown: scrolls the pattern towards us
    uniform float twist;
    uniform float density;
    uniform float brightness;
    uniform float bass;       // makes the walls pulse
    uniform float pattern;    // 0 = rings, 1 = stripes, 2 = checks (picked by the seed)
    uniform float stripes;    // how many stripes around the tube (picked by the seed)
    uniform float sharpness;  // soft or hard-edged bands (picked by the seed)
    uniform vec3 colourA;
    uniform vec3 colourB;

    const float TAU = 6.2831853;

    void main() {
        float around = vUV.x;                            // 0 to 1, once round the tube
        float along = vUV.y * 120.0 * density - travel;  // repeats down the tube, scrolling towards us

        // Three pattern styles; twist skews each one into a spiral
        float rings = 0.5 + 0.5 * sin((along + around * twist) * TAU);
        float bands = 0.5 + 0.5 * sin((around * stripes + along * twist * 0.25) * TAU);
        float checks = mod(floor(along + around * twist) + floor(around * stripes), 2.0);

        float value = pattern < 0.5 ? rings : (pattern < 1.5 ? bands : checks);
        value = pow(value, sharpness);

        // Blend the two colours, brighten the light parts, and pulse with the bass
        vec3 colour = mix(colourA, colourB, value);
        colour *= 0.35 + value * 0.65 + bass * 0.5;

        // Fade into darkness towards the far ends, for depth
        float fade = 1.0 - smoothstep(20.0, 190.0, abs(vAlong));

        gl_FragColor = vec4(colour * brightness * fade, 1.0);
    }
`;

const MAX_WARP_BOOST = 0.6;
const WARP_EASING = 0.1;

//Post process
const WARP_FRAGMENT = `
    precision highp float;

    varying vec2 vUV;                 // where this pixel is on screen (0 to 1)
    uniform sampler2D textureSampler; // the finished frame
    uniform float amount;             // how strong the warp is right now
    uniform float time;
    uniform float aspect;             // screen width / height, so the twirl is round, not oval

    void main() {
    vec2 centre = vec2(0.5);
    vec2 offset = (vUV - centre) * vec2(aspect, 1.0);
    float dist = length(offset);

    // Twirl: turn more near the middle, fading out towards the edges, with a slow sway
    float angle = amount * 1.2 * (1.0 - smoothstep(0.0, 0.8, dist));
    angle += sin(time * 0.7) * amount * 0.3;
    float s = sin(angle);
    float c = cos(angle);
    offset = mat2(c, -s, s, c) * offset;

    // Ripple: rings pulsing outward from the centre
    offset *= 1.0 + sin(dist * 30.0 - time * 4.0) * 0.015 * amount;

    // Read the frame from the warped spot instead of this pixel's own spot
    gl_FragColor = texture2D(textureSampler, centre + offset / vec2(aspect, 1.0));
}
`;

BabylonEffect.ShadersStore["wormholeWarpFragmentShader"] = WARP_FRAGMENT;

//The effect
export function createWormhole(scene: Scene): Effect {
    const tube = MeshBuilder.CreateCylinder(
        "wormhole",
        {
            height: TUBE.length,
            diameter: TUBE.radius * 2,
            tessellation: TUBE.around,
            subdivisions: TUBE.along,
            cap: Mesh.NO_CAP,
        },
        scene,
    );
    tube.rotation.x = Math.PI / 2; // lay it along Z, the way the front camera looks
    tube.isPickable = false;
    tube.setEnabled(false);

    const material = new ShaderMaterial(
        "wormholeMaterial",
        scene,
        { vertexSource: VERTEX, fragmentSource: FRAGMENT },
        {
            attributes: ["position", "uv"],
            uniforms: [
                "worldViewProjection", "time", "wobble", "travel", "twist", "density", "brightness",
                "bass", "pattern", "stripes", "sharpness", "colourA", "colourB",
            ],
        },
    );

    const warpPass = new PostProcess(
        "wormholeWarp",
        "wormholeWarp",
        ["amount", "time", "aspect"],
        null,
        1.0,
        null, 
        Texture.BILINEAR_SAMPLINGMODE,
        scene.getEngine(),
    );

    let warp = 0;
    let warpReaction: Reaction = { source: "none", amount: 0 };
    let warpAmount = 0;
    let warpCamera: Camera | null = null;

    warpPass.onApply = (effect) => {
        effect.setFloat("amount", warpAmount);
        effect.setFloat("time", time);
        effect.setFloat("aspect", warpPass.aspectRatio);
    };

    function attachWarp(camera: Camera | null) {
        if (camera === warpCamera) return;
        warpCamera?.detachPostProcess(warpPass);
        camera?.attachPostProcess(warpPass);
        warpCamera = camera;
    }

    material.backFaceCulling = false; // inside tube looking at walls
    tube.material = material;

    let enabled = false;
    let speed = 1;
    let speedReaction: Reaction = { source: "none", amount: 0 };
    let travel = 0;
    let time = 0;
    let currentSeed: string | null = null;
    let seedPalette = PALETTES[0];


    function applySeed(seed: string) {
        if (seed === currentSeed) return;
        currentSeed = seed;

        const random = createRandom(seed);
        material.setFloat("pattern", random.int(0, 2));
        material.setFloat("stripes", random.int(3, 12));
        material.setFloat("sharpness", random.range(1, 4));
        material.setFloat("wobble", random.range(0, 2.5));
        seedPalette = random.pick(PALETTES);
    }

    return {
        apply({ mode, wormhole }: VisualSettings) {
            enabled = mode === "wormhole";
            tube.setEnabled(enabled);
            if (!enabled) attachWarp(null);
            warp = wormhole.warp;
            warpReaction = wormhole.warpReaction;

            applySeed(wormhole.seed);

            speed = wormhole.speed;
            speedReaction = wormhole.speedReaction;

            material.setFloat("twist", wormhole.twist);
            material.setFloat("density", wormhole.density);
            material.setFloat("brightness", wormhole.brightness);
            tube.scaling.set(wormhole.radius, 1, wormhole.radius);

            const [a, b] = wormhole.useSeedColours ? seedPalette : [wormhole.colourA, wormhole.colourB];
            material.setColor3("colourA", Color3.FromHexString(a));
            material.setColor3("colourB", Color3.FromHexString(b));
        },

        update(features: AudioFeatures) {
            if (!enabled) return;

            const seconds = scene.getEngine().getDeltaTime() / 1000;
            time += seconds;

            travel += (speed + readReaction(speedReaction, features) * MAX_SPEED_BOOST) * seconds;

            material.setFloat("time", time);
            material.setFloat("travel", travel);
            material.setFloat("bass", features.bands.subBass);


            const warpTarget = warp + readReaction(warpReaction, features) * MAX_WARP_BOOST;
            warpAmount += (warpTarget - warpAmount) * WARP_EASING;
            attachWarp(warpAmount > 0.001 ? scene.activeCamera : null);
        },

        dispose(){
            attachWarp(null);
            warpPass.dispose();
            material.dispose();
            tube.dispose();
        },
    };
}
        