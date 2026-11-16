import { Scene, ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";
import type { Bands } from "../audio/audioAnalyser";

function createSoftDot(scene: Scene) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.3"); 
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new Texture(canvas.toDataURL(), scene);
}

function createHitDetector (minRise: number, minLevel: number, cooldownFrames = 8) {
    let last = 0;
    let cooldown = 0;

    return (level: number) => {
        const rise = level - last;
        last = level;
        cooldown = Math.max(0, cooldown - 1);

        if (rise > minRise && level > minLevel && cooldown === 0){
            cooldown = cooldownFrames;
            return true;
        }
        return false;
    };
}

export function createSmoke(scene: Scene){
    const smoke = new ParticleSystem("smoke", 3000, scene);
    smoke.particleTexture = createSoftDot(scene);

    //Where the smoke spawns
    smoke.emitter = Vector3.Zero();
    smoke.createSphereEmitter(1.5, 0);
    smoke.minEmitPower = 0.8;
    smoke.maxEmitPower = 1.6;

    //how the smoke looks
    smoke.minSize = 0.6;
    smoke.maxSize = 1.8;
    smoke.minLifeTime = 2;
    smoke.maxLifeTime = 4;

    
    smoke.color1 = new Color4(1, 0, 0.5, 0.2);
    smoke.color2 = new Color4(0.3, 0, 1, 0.2);
    smoke.colorDead = new Color4(0, 0, 0, 0);
    smoke.blendMode = ParticleSystem.BLENDMODE_ADD;

    smoke.emitRate = 0;
    smoke.start();

    const windTarget = new Vector3();

    //detection near kick frequencies
    const isKick = createHitDetector(0.05, 0.5);
    const isSnare = createHitDetector(0.04, 0.35);
    const outward = new Vector3();

    function disperse(force: number) {
        for (const p of smoke.particles) {
            if (Math.random() < 0.3) continue; 
            p.position.normalizeToRef(outward);
            p.direction.addInPlace(outward.scaleInPlace(force * (0.5 + Math.random())));
        }
    }

    return{
        update ({ subBass, midBass, mid, high }: Bands){
            //smoke from more subBass
            smoke.emitRate = 20 + subBass * 200;

            //pick random wind direction, more from highs
            if (Math.random() < 0.01 + high * 0.1){
                windTarget.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            }

            //Ease wind in that direction. mids blow harder
            const strength = 0.5 + mid * 4; 
            smoke.gravity.x += (windTarget.x * strength - smoke.gravity.x) * 0.05;
            smoke.gravity.y += (windTarget.y * strength - smoke.gravity.y) * 0.05;
            smoke.gravity.z += (windTarget.z * strength - smoke.gravity.z) * 0.05;

            if (isKick(midBass)){
                disperse(1 + midBass * 3);
            }
            if (isSnare(mid)){
                disperse (0.8 + mid * 2);
            }

            for (const p of smoke.particles){
                p.direction.scaleInPlace(0.99);
            }

        },
    };
}