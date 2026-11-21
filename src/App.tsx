import { useEffect, useState } from "react";
import BabylonCanvas from "./components/BabylonCanvas";
import ControlPanel from "./components/ControlPanel";
import TopBar from "./components/TopBar";
import AddBar from "./components/AddBar";
import Outliner from "./components/Outliner";
import GizmoToolbar from "./components/GizmoToolbar";
import { audio } from "./audio/audioAnalyser";
import type { GizmoMode } from "./scene/gizmos";
import {
  createByType,
  defaultSettings,
  nextObjectName,
  spawnPosition,
  withoutObject,
  type AddType,
  type SceneObject,
  type UpdateObject,
  type UpdateSettings,
  type VisualSettings,
} from "./scene/settings";

export default function App() {
  const [settings, setSettings] = useState<VisualSettings>(defaultSettings);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performing, setPerforming] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(defaultSettings.objects[0]?.id ?? null);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>("move");

  const updateSettings: UpdateSettings = (group, changes) => {
    setSettings((previous) => ({
      ...previous,
      [group]: { ...previous[group], ...changes },
    }));
  };

  const updateObject: UpdateObject = (id, changes) => {
    setSettings((previous) => ({
      ...previous,
      objects: previous.objects.map((object) =>
        object.id === id ? ({ ...object, ...changes } as SceneObject) : object,
      ),
    }));
  };

  function addObject(type: AddType) {
    const object = createByType(type, {
      name: nextObjectName(type, settings.objects),
      position: spawnPosition(settings.objects.length),
    });
    setSettings((previous) => ({ ...previous, objects: [...previous.objects, object] }));
    setSelectedId(object.id); // select it, so the panel shows it straight away
  }

  function deleteObject(id: string) {
    setSettings((previous) => ({ ...previous, objects: withoutObject(previous.objects, id) }));
    setSelectedId((current) => (current === id ? null : current));
  }

  //Leave performance mode when fullscreen ends or Esc is pressed
  useEffect(() => {
    function onFullScreenChange() {
      if (!document.fullscreenElement) setPerforming(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPerforming(false);
    }

    document.addEventListener("fullscreenchange", onFullScreenChange);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  //Delete key removes the selected item (but not while typing in a box)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" || !selectedId) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const id = selectedId;
      setSettings((previous) => ({ ...previous, objects: withoutObject(previous.objects, id) }));
      setSelectedId(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  //W / E / R switch between move, rotate and scale (but not while typing)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toLowerCase();
      if (key === "w") setGizmoMode("move");
      if (key === "e") setGizmoMode("rotate");
      if (key === "r") setGizmoMode("scale");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function startPerforming() {
    setPerforming(true);
    document.documentElement.requestFullscreen().catch(() => {
      // Fullscreen can be refused; the UI still hides
    });
  }

  async function handleStart() {
    setError(null);
    try {
      await audio.startSystemAudio(() => setListening(false));
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start audio");
    }
  }

  function handleStop() {
    audio.stop();
    setListening(false);
  }

  return (
    <main className={`relative h-screen w-screen overflow-hidden bg-black ${performing ? "cursor-none" : ""}`}>
      <BabylonCanvas
        settings={settings}
        selectedId={performing ? null : selectedId}
        gizmoMode={gizmoMode}
        onSelectObject={setSelectedId}
        onTransformEnd={updateObject}
      />

      {!performing && (
        <>
          <TopBar
            listening={listening}
            onStartAudio={handleStart}
            onStopAudio={handleStop}
            onPerform={startPerforming}
          />

          {error && (
            <p className="absolute left-1/2 top-16 max-w-md -translate-x-1/2 rounded bg-red-500/20 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Outliner
            objects={settings.objects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRename={(id, name) => updateObject(id, { name })}
            onSetVisible={(id, visible) => updateObject(id, { visible })}
            onDelete={deleteObject}
          />

          {selectedId && <GizmoToolbar mode={gizmoMode} onChange={setGizmoMode} />}

          <ControlPanel
            settings={settings}
            onChange={updateSettings}
            selectedId={selectedId}
            onObjectChange={updateObject}
            onSelectObject={setSelectedId}
            onDeleteObject={deleteObject}
          />

          <AddBar onAdd={addObject} />
        </>
      )}
    </main>
  );
}