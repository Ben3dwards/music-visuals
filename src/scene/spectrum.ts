import { Scene, MeshBuilder, StandardMaterial, Color3, Matrix, Quaternion, Vector3, TransformNode } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyEntityTransform, type EntityInstance } from "./entity";
import { setGlowStrength } from "./glow";
import type { SceneObject } from "./settings";

const TUNING = {
    ring: { bars: 64, barWidth: 0.08, radius: 1.5, maxHeight: 1.5 },
    grid: { columns: 32, rows: 24, barWidth: 0.18, spacing: 0.25, floorY: -2.5, frontZ: -2, maxHeight: 2 },
    easing: 0.35, // how quickly ring bars follow the music (1 = instantly)
};


function createGlowMaterial(name: string, scene: Scene): StandardMaterial {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.Black();
    return material;
}


function createBarSet(name: string, count: number, width: number, material: StandardMaterial, scene: Scene, parent: TransformNode) {
    const mesh = MeshBuilder.CreateBox(name, { width, depth: width, height: 1 }, scene);
    mesh.material = material;
    mesh.parent = parent;
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;

    const matrices = new Float32Array(count * 16);
    mesh.thinInstanceSetBuffer("matrix", matrices, 16, false);

    const matrix = new Matrix();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const position = new Vector3();
    let widthScale = 1;

    return {
        set(i: number, x: number, y: number, z: number, angle: number, height: number) {
            scale.set(widthScale, Math.max(height, 0.001), widthScale);
            Quaternion.FromEulerAnglesToRef(0, 0, angle, rotation);
            position.set(x, y, z);
            Matrix.ComposeToRef(scale, rotation, position, matrix);
            matrix.copyToArray(matrices, i * 16);
        },
        commit() {
            mesh.thinInstanceBufferUpdated("matrix");
        },
        setVisible(visible: boolean) {
            mesh.setEnabled(visible);
        },
        setWidth(value: number) {
            widthScale = value;
        },
        setBloom(strength: number) {
            setGlowStrength(mesh, strength);
        },
        dispose() {
            mesh.dispose();
        },
    };
}



function sampleSpectrum(spectrum: Uint8Array, count: number, out: Float32Array) {
    const minBin = 1;
    const maxBin = Math.max(2, Math.floor(spectrum.length * 0.5));

    for (let i = 0; i < count; i++) {
    const start = Math.floor(minBin * Math.pow(maxBin / minBin, i / count));
    const end = Math.max(start + 1, Math.floor(minBin * Math.pow(maxBin / minBin, (i + 1) / count)));

    let sum = 0;
    for (let bin = start; bin < end; bin++) sum += spectrum[bin] ?? 0;
    out[i] = sum / (end - start) / 255;
    }
}


export function createSpectrum(scene: Scene, id: string): EntityInstance {
    const { ring: RING, grid: GRID } = TUNING;

    const transform = new TransformNode(`transform-${id}`, scene);

    const ringMaterial = createGlowMaterial(`spectrumRingMaterial-${id}`, scene);
    const ring = createBarSet(`spectrumRing-${id}`, RING.bars, RING.barWidth, ringMaterial, scene, transform);

    const gridRows = Array.from({ length: GRID.rows }, (_, row) => {
    const material = createGlowMaterial(`spectrumGridMaterial-${id}-${row}`, scene);
    const bars = createBarSet(`spectrumGridRow-${id}-${row}`, GRID.columns, GRID.barWidth, material, scene, transform);
    return { material, bars };
    });

    const halfRing = RING.bars / 2;
    const ringTargets = new Float32Array(halfRing);
    const ringLevels = new Float32Array(halfRing);
    const history = Array.from({ length: GRID.rows }, () => new Float32Array(GRID.columns));

    let showRing = true;
    let showGrid = false;
    let heightScale = 1;
    let ringRadius = RING.radius;
    let gridSpacing = GRID.spacing;

    function rowBrightness(row: number, fade: number): number {
    return 1 - fade * (row / (GRID.rows - 1));
    }

    function updateRing(spectrum: Uint8Array) {
    sampleSpectrum(spectrum, halfRing, ringTargets);
    for (let i = 0; i < halfRing; i++) {
        ringLevels[i] += (ringTargets[i] - ringLevels[i]) * TUNING.easing;
    }

    for (let i = 0; i < RING.bars; i++) {
        const level = ringLevels[i < halfRing ? i : RING.bars - 1 - i];
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
        const { bars } = gridRows[row];
        const z = GRID.frontZ + row * gridSpacing;
        for (let column = 0; column < GRID.columns; column++) {
        const height = history[row][column] * GRID.maxHeight * heightScale;
        const x = (column - (GRID.columns - 1) / 2) * gridSpacing;
        const y = GRID.floorY + height / 2;
        bars.set(column, x, y, z, 0, height);
        }
        bars.commit();
    }
    }

    return {
        node: transform,

        apply(object: SceneObject) {
            if (object.kind !== "spectrum") return;
            applyEntityTransform(transform, object);

            const settings = object.spectrum;
            showRing = settings.ring;
            showGrid = settings.grid;
            heightScale = settings.height;
            ringRadius = RING.radius * settings.radius; // the item's own Size is applied by its node
            gridSpacing = GRID.spacing * settings.gridSpacing;

            const colour = Color3.FromHexString(settings.colour).scale(settings.brightness);

            ring.setVisible(showRing);
            ring.setWidth(settings.barWidth);
            ring.setBloom(settings.bloom);
            ringMaterial.emissiveColor = colour;

            gridRows.forEach(({ material, bars }, row) => {
            const brightness = rowBrightness(row, settings.fade);
            bars.setVisible(showGrid);
            bars.setWidth(settings.barWidth);
            bars.setBloom(settings.bloom * brightness);
            material.emissiveColor = colour.scale(brightness);
            });
        },

        update({ spectrum }: AudioFeatures) {
            if (!transform.isEnabled()) return; // hidden: skip the work
            if (showRing) updateRing(spectrum);
            if (showGrid) updateGrid(spectrum);
        },

        setSelected() {
            // Spectrum bars aren't clickable, so there's no highlight; select it from the object list
        },

        dispose() {
            ring.dispose();
            ringMaterial.dispose();
            for (const { material, bars } of gridRows) {
            bars.dispose();
            material.dispose();
            }
            transform.dispose();
        },
    };
}