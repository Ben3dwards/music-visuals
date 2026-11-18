import type { AbstractMesh } from "@babylonjs/core";


//How strongly a mesh blooms in the glow layer: 0 = none, 1 = normal, 2 = double. Works on any object
export function setGlowStrength(mesh: AbstractMesh, strength: number){
    mesh.metadata = { ...mesh.metadata, glowStrength: strength };
}


export function getGlowStrength(mesh: AbstractMesh): number {
    return mesh.metadata?.glowStrength ?? 1;
}