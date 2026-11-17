import { Scene, ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";

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

export function createSmoke(scene: Scene){
    const smoke = new ParticleSystem("smoke", 3000, scene);
    smoke.particleTexture = createSoftDot(scene);

    //spawn around shape on a sphere
    smoke.emitter = Vector3.Zero();
    smoke.createSphereEmitter(1.5, 0);
    smoke.minEmitPower = 0.8;
    smoke.maxEmitPower = 2;

    //apperance
    smoke.minSize = 0.6;
    smoke.maxSize = 2;
    smoke.minLifeTime = 2;
    smoke.maxLifeTime = 4;
    smoke.color1 = new Color4(1, 0, 0.5, 0.2);
    smoke.color2 = new Color4(0.3, 0, 1, 0.2);
    smoke.colorDead = new Color4(0, 0, 0, 0);
    smoke.blendMode = ParticleSystem.BLENDMODE_ADD;   
    
    smoke.emitRate = 0;
    smoke.start();

    //state
    let density = 0.5;
    const windTarget = new Vector3();
    const outward = new Vector3();


    //push particals awayfrom centre, like a shockwave
    function disperse(force: number){
        for (const p of smoke.particles) {
            if (Math.random() < TUNING.disperseSkipChance) continue;
            p.position.normalizeToRef(outward);
            p.direction.addInPlace(outward.scaleInPlace(force * (0.5 + Math.random())));
        }
    }

    //more smoke when sub-bass is heavy. scaled by user settings
    
    function updateEmitRate(subBass: number){
        const { base, subBassBoost } = TUNING.emitRate;
        smoke.emitRate = density * (base + subBass * subBassBoost);
    }

    //radnom wind blows harder with mids
    function updateWind(mid: number, high: number) {
        const { changeChance, highsBoost, strength, midsBoost, easing } = TUNING.wind;

        if (Math.random() < changeChance + high * highsBoost) {
            windTarget.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        }

        const windStrength = strength + mid * midsBoost;
        smoke.gravity.x += (windTarget.x * windStrength - smoke.gravity.x) * easing;
        smoke.gravity.y += (windTarget.y * windStrength - smoke.gravity.y) * easing;
        smoke.gravity.z += (windTarget.z * windStrength - smoke.gravity.z) * easing;
    }
    
    // Slows every particle a bit. blasts settle back into drifting smoke. 
    function applyDrag() {
        for (const p of smoke.particles) {
            p.direction.scaleInPlace(TUNING.drag);
        }
    }

    return {
        update({ bands, kick, snare }: AudioFeatures) {
            updateEmitRate(bands.subBass);
            updateWind(bands.mid, bands.high);
            
            if (kick) disperse(TUNING.kickPush.base + bands.midBass * TUNING.kickPush.boost);
            if (snare) disperse(TUNING.snarePush.base + bands.snare * TUNING.snarePush.boost);

            applyDrag();
        },

        setEnabled(enabled: boolean){
            if (enabled && !smoke.isStarted()) smoke.start();
            if (!enabled && smoke.isStarted ()) smoke.stop();
        },

        setDensity(value: number){
            density = value;
        },
    };
}