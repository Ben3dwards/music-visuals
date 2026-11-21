import { GizmoManager, type Scene, type TransformNode } from "@babylonjs/core";
import type { ObjectTransform } from "./settings";

export type GizmoMode = "move" | "rotate" | "scale";

export function createGizmos(scene: Scene, onTransformEnd: (transform: ObjectTransform) => void) {
    const manager = new GizmoManager(scene);
    manager.usePointerToAttachGizmos = false;

    //Create all three at once
      manager.positionGizmoEnabled = true;
    manager.rotationGizmoEnabled = true;
    manager.scaleGizmoEnabled = true;
    const { positionGizmo, rotationGizmo, scaleGizmo } = manager.gizmos;

    //move along the worlds axes
    positionGizmo!.updateGizmoRotationToMatchAttachedMesh = false;

    //size is 1 number so only offer the uniform scale handle
    scaleGizmo!.xGizmo.isEnabled = false;
    scaleGizmo!.yGizmo.isEnabled = false;
    scaleGizmo!.zGizmo.isEnabled = false;

    let attached: TransformNode | null = null;

    //after a drag reads the nods placement and report it in settings
    function report() {
        if (!attached) return;

        if (attached.rotationQuaternion) {
            const euler = attached.rotationQuaternion.toEulerAngles();
            attached.rotationQuaternion = null;
            attached.rotation.copyFrom(euler);
        }

        const toDegrees = 180 / Math.PI;
        const round = (value: number) => Math.round(value * 100) / 100;
        const { position, rotation, scaling } = attached;

        onTransformEnd({
            position: { x: round(position.x), y: round(position.y), z: round(position.z) },
            rotation: {
                x: round(rotation.x * toDegrees),
                y: round(rotation.y * toDegrees),
                z: round(rotation.z * toDegrees),
            },
            scale: round(scaling.x),
            });
        }

        positionGizmo!.onDragEndObservable.add(report);
        rotationGizmo!.onDragEndObservable.add(report);
        scaleGizmo!.onDragEndObservable.add(report);

        function setMode(mode: GizmoMode) {
            manager.positionGizmoEnabled = mode === "move";
            manager.rotationGizmoEnabled = mode === "rotate";
            manager.scaleGizmoEnabled = mode === "scale";
        }

        setMode("move");

          return {
            attach(node: TransformNode | null) {
                attached = node;
                manager.attachToNode(node);
            },
            setMode,
            dispose() {
                manager.dispose();
            }
          }

}