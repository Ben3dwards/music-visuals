import { Scene, MeshBuilder, StandardMaterial, Color3, Matrix, Quaternion, Vector3 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import type { VisualSettings } from "./settings";

const TUNING ={
    ring: { bars: 64, barWidth: 0.08, radius: 1.5, maxHeight: 1.5 },
    grid: { columns: 32, rows: 24, barWidth: 0.18, spacing: 0.25, floorY: -2.5, frontZ: -2, maxHeight: 2 },
    easing: 0.35, // how quickly ring bars follow the music (1 = instantly)
};


function createBarSet(name: string, count: number, width: number, material: StandardMaterial, scene: Scene){
    const mesh = MeshBuilder.CreateBox(name, { width, depth: width, height: 1}, scene);
    mesh.material = material;
    mesh.alwaysSelectAsActiveMesh = true;

    const matrices = new Float32Array(count * 16) //one 4x4 matrix
    mesh.thinInstanceSetBuffer("matrix", matrices, 16, false);

    //working objects, reused fevery frame
    const matrix = new Matrix();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const position = new Vector3();

    return {
        set(i: number, x: number, y: number, z: number, angle: number, height: number){
            scale.set(1, Math.max(height, 0.001), 1);
            Quaternion.FromEulerAnglesToRef(0, 0, angle, rotation);
            position.set(x, y, z);
            Matrix.ComposeToRef(scale, rotation, position, matrix);
            matrix.copyToArray(matrices, i * 16);
        },

        //sends this frames bar position to GPU
        commit() {
            mesh.thinInstanceBufferUpdated("matrix");
        },

        setVisible(visible: boolean) {
            mesh.setEnabled(visible);
        },

        dispose(){
            mesh.dispose();
        },
    };
}

function sampleSpectrum(spectrum: Uint8Array, count: number, out:Float32Array ){
    const minBin = 1;
    const maxBin = Math.max(2, Math.floor(spectrum.length * 0.5)); // roughly 0–12kHz

    for (let i = 0; i < count; i++){
        const start = Math.floor(minBin * Math.pow(maxBin/minBin,i/count));
        const end = Math.max(start + 1, Math.floor(minBin * Math.pow(maxBin / minBin, (i + 1) / count)));

        let sum = 0;
        for (let bin = start; bin < end; bin++) sum += spectrum[bin] ?? 0;
        out[i] = sum / (end - start) / 255;
    }
}


export function createSpectrum(scene: Scene): Effect {
    const { ring: RING, grid: GRID } = TUNING;

    const material = new StandardMaterial("spectrumMaterial", scene);
    material.diffuseColor = Color3.Black();

    const ring = createBarSet("spectrumRing", RING.bars, RING.barWidth, material, scene);
    const grid = createBarSet("spectrumGrid", GRID.columns * GRID.rows, GRID.barWidth, material, scene);

    //ring is mirrored, only needs half as many value
    const halfRing = RING.bars / 2;
    const ringTargets = new Float32Array(halfRing);
    const ringLevels = new Float32Array(halfRing);

    const history = Array.from({ length: GRID.rows }, () => new Float32Array(GRID.columns));

    //state from settings
    let showRing = true;
    let showGrid = false;
    let heightScale = 1;
    let ringRadius = RING.radius;

    function updateRing(spectrum: Uint8Array) {
        sampleSpectrum(spectrum, halfRing, ringTargets);

        //Ease each bar towards its new level. ring moves smoothly
        for (let i = 0; i < halfRing; i++) {
            ringLevels[i] += (ringTargets[i] - ringLevels[i]) * TUNING.easing;
        }

        for (let i = 0; i < RING.bars; i++) {
            const level = ringLevels[i < halfRing ? i : RING.bars - 1 - i]; //mirror the second half
            const angle = Math.PI / 2 + (i / RING.bars) * Math.PI * 2;
            const height = level * RING.maxHeight * heightScale;
            const distance = ringRadius + height / 2;

            ring.set(i, Math.cos(angle) * distance, Math.sin(angle) * distance, 0, angle - Math.PI / 2, height);
        }
        ring.commit();
    }


    function updateGrid(spectrum: Uint8Array) {
        const newest = history.pop()!;
        sampleSpectrum(spectrum, GRID.columns, newest);
        history.unshift(newest);

        for (let row = 0; row < GRID.rows; row++) {
            for (let column = 0; column < GRID.columns; column++) {
                const height = history[row][column] * GRID.maxHeight * heightScale;
                const x = (column - (GRID.columns - 1) / 2) * GRID.spacing;
                const y = GRID.floorY + height / 2;
                const z = GRID.frontZ + row * GRID.spacing;

                grid.set(row * GRID.columns + column, x, y, z, 0, height);
            }
        }

        grid.commit();
    }

    return {
         apply({ spectrum: settings, shape }: VisualSettings) {
            showRing = settings.ring;
            showGrid = settings.grid;
            ring.setVisible(showRing);
            grid.setVisible(showGrid);

            heightScale = settings.height;
            ringRadius = RING.radius * shape.scale * settings.radius;
            material.emissiveColor = Color3.FromHexString(settings.colour);
         },

         update({ spectrum }: AudioFeatures){
            if (showRing) updateRing(spectrum);
            if (showGrid) updateGrid(spectrum);
         },

         dispose(){
            ring.dispose();
            grid.dispose();
            material.dispose();
         },
    };
}