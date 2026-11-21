import { Scene, ParticleSystem, Texture, Vector3, Color3, Color4, TransformNode } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyEntityTransform, type EntityInstance } from "./entity";
import type { SceneObject, WindMode } from "./settings";

const TUNING = {
    spawnRadius: 1.5,
    puffSize: { min: 0.6, max: 1.8 },
    puffAlpha: 0.2,
    emitRate: { base: 30, subBassBoost: 300 },
    wind: { changeChance: 0.01, highsBoost: 0.1, strength: 0.5, midsBoost: 4, easing: 0.05 },
    kickPush: { base: 2, boost: 4 },
    snarePush: { base: 3, boost: 5 },
    disperseSkipChance: 0.3,
    drag: 0.99,
};

const WIND_DIRECTIONS: Record<Exclude<WindMode, "random">, Vector3> = {
    left: new Vector3(-1, 0, 0),
    right: new Vector3(1, 0, 0),
    up: new Vector3(0, 1, 0),
    down: new Vector3(0, -1, 0),
};

function createSoftDot(scene: Scene): Texture {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d")!;
    const centre = size / 2;
    const gradient = ctx.createRadialGradient(centre, centre, 0, centre, centre, centre);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new Texture(canvas.toDataURL(), scene);
}

function toPuffColour(hex: string): Color4 {
    return Color3.FromHexString(hex).toColor4(TUNING.puffAlpha);
}



export function createSmoke(scene: Scene, id: string): EntityInstance {
    const transform = new TransformNode(`transform-${id}`, scene);
    const centre = new Vector3(); //the node's world position, refreshed every frame

    const particles = new ParticleSystem(`smoke-${id}`, 3000, scene);
    particles.particleTexture = createSoftDot(scene);
    particles.emitter = centre; //spawn around the centre point 
    particles.minEmitPower = 0.8;
    particles.maxEmitPower = 1.6;
    particles.minLifeTime = 2;
    particles.maxLifeTime = 4;
    particles.colorDead = new Color4(0, 0, 0, 0);
    particles.blendMode = ParticleSystem.BLENDMODE_ADD;
    particles.emitRate = 0;
    particles.start();

    let density = 0.5;
    let windMode: WindMode = "random";
    let windIntensity = 1;
    const windTarget = new Vector3();
    const outward = new Vector3();

    function disperse(force: number) {
        for (const p of particles.particles) {
            if (Math.random() < TUNING.disperseSkipChance) continue;
                p.position.subtractToRef(centre, outward); //direction from the centre to this puff
                outward.normalize();
                p.direction.addInPlace(outward.scaleInPlace(force * (0.5 + Math.random())));
        }
    }

    function updateEmitRate(subBass: number) {
        const { base, subBassBoost } = TUNING.emitRate;
        particles.emitRate = density * (base + subBass * subBassBoost);
    }

    function updateWind(mid: number, high: number) {
        const { changeChance, highsBoost, strength, midsBoost, easing } = TUNING.wind;

        if (windMode === "random") {
            if (Math.random() < changeChance + high * highsBoost) {
                windTarget.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            }
        } else {
            windTarget.copyFrom(WIND_DIRECTIONS[windMode]);
        }

        const windStrength = (strength + mid * midsBoost) * windIntensity;
        particles.gravity.x += (windTarget.x * windStrength - particles.gravity.x) * easing;
        particles.gravity.y += (windTarget.y * windStrength - particles.gravity.y) * easing;
        particles.gravity.z += (windTarget.z * windStrength - particles.gravity.z) * easing;
    }

    function applyDrag() {
        for (const p of particles.particles) {
            p.direction.scaleInPlace(TUNING.drag);
            }
        }

    return {
        node: transform,

        apply(object: SceneObject) {
            if (object.kind !== "smoke") return;
            applyEntityTransform(transform, object);

            const smoke = object.smoke;
            const active = object.visible && smoke.enabled;
            if (active && !particles.isStarted()) particles.start();
            if (!active && particles.isStarted()) particles.stop();

            density = smoke.density;
            windMode = smoke.windMode;
            windIntensity = smoke.wind;

            particles.createSphereEmitter(TUNING.spawnRadius * object.scale * smoke.spread, 0);
            particles.minSize = TUNING.puffSize.min * smoke.size;
            particles.maxSize = TUNING.puffSize.max * smoke.size;
            particles.color1 = toPuffColour(smoke.colourA);
            particles.color2 = toPuffColour(smoke.colourB);
        },

        update({ bands, kick, snare }: AudioFeatures) {
            // Follow the node: the emitter is `centre`, so updating it moves where smoke spawns
            transform.computeWorldMatrix(true);
            centre.copyFrom(transform.getAbsolutePosition());

            updateEmitRate(bands.subBass);
            updateWind(bands.mid, bands.high);

            if (kick) disperse(TUNING.kickPush.base + bands.midBass * TUNING.kickPush.boost);
            if (snare) disperse(TUNING.snarePush.base + bands.snare * TUNING.snarePush.boost);

            applyDrag();
        },

        setSelected() {
            // Smoke isn't clickable; select it from the object list
        },

        dispose() {
            particles.dispose();
            transform.dispose();
        },
    };
}