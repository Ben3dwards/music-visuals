import { Scene, ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import type { VisualSettings } from "./settings";

const TUNING = {
    emitRate: { base: 30, subBassBoost: 300 },
    wind: { changeChance: 0.01, highsBoost: 0.1, strength: 0.5, midsBoost: 4, easing: 0.05 },
    kickPush: { base: 2, boost: 4 },
    snarePush: { base: 3, boost: 5 },
    disperseSkipChance: 0.3, // fraction of particles a hit leaves untouched
    drag: 0.99,              // how much speed each particle keeps per frame
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

export function createSmoke(scene: Scene): Effect {
    const particles = new ParticleSystem("smoke", 3000, scene);
    particles.particleTexture = createSoftDot(scene);

    //spawn around shape on a sphere
    particles.emitter = Vector3.Zero();
    particles.createSphereEmitter(1.5, 0);
    particles.minEmitPower = 0.8;
    particles.maxEmitPower = 1.6;

    //apperance
    particles.minSize = 0.6;
    particles.maxSize = 1.8;
    particles.minLifeTime = 2;
    particles.maxLifeTime = 4;
    particles.color1 = new Color4(1, 0, 0.5, 0.2);
    particles.color2 = new Color4(0.3, 0, 1, 0.2);
    particles.colorDead = new Color4(0, 0, 0, 0);
    particles.blendMode = ParticleSystem.BLENDMODE_ADD;

    particles.emitRate = 0;
    particles.start();

    //state
    let density = 0.5;
    const windTarget = new Vector3();
    const outward = new Vector3();


    //push particals awayfrom centre, like a shockwave
    function disperse(force: number) {
        for (const p of particles.particles) {
            if (Math.random() < TUNING.disperseSkipChance) continue;
            p.position.normalizeToRef(outward);
            p.direction.addInPlace(outward.scaleInPlace(force * (0.5 + Math.random())));
        }
    }

    //more smoke when sub-bass is heavy. scaled by user settings
    
    function updateEmitRate(subBass: number) {
        const { base, subBassBoost } = TUNING.emitRate;
        particles.emitRate = density * (base + subBass * subBassBoost);
    }

    //radnom wind blows harder with mids
    function updateWind(mid: number, high: number) {
        const { changeChance, highsBoost, strength, midsBoost, easing } = TUNING.wind;

        if (Math.random() < changeChance + high * highsBoost) {
            windTarget.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        }

        const windStrength = strength + mid * midsBoost;
        particles.gravity.x += (windTarget.x * windStrength - particles.gravity.x) * easing;
        particles.gravity.y += (windTarget.y * windStrength - particles.gravity.y) * easing;
        particles.gravity.z += (windTarget.z * windStrength - particles.gravity.z) * easing;
    }
    
    // Slows every particle a bit. blasts settle back into drifting smoke. 
    function applyDrag() {
        for (const p of particles.particles) {
            p.direction.scaleInPlace(TUNING.drag);
        }
    }

    return {
        apply({ smoke }: VisualSettings) {
            if (smoke.enabled && !particles.isStarted()) particles.start();
            if (!smoke.enabled && particles.isStarted()) particles.stop();
            density = smoke.density;
        },
        
        update({ bands, kick, snare }: AudioFeatures) {
            updateEmitRate(bands.subBass);
            updateWind(bands.mid, bands.high);

            if (kick) disperse(TUNING.kickPush.base + bands.midBass * TUNING.kickPush.boost);
            if (snare) disperse(TUNING.snarePush.base + bands.snare * TUNING.snarePush.boost);

            applyDrag();
        },
        
        dispose() {
            particles.dispose();
        },
    };
}