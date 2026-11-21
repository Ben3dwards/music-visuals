import { useEffect, useState } from "react";
import BabylonCanvas from "./components/BabylonCanvas";
import ControlPanel from "./components/ControlPanel";
import TopBar from "./components/TopBar";
import AddBar from "./components/AddBar";
import { audio } from "./audio/audioAnalyser";
import {
  createObject,
  defaultSettings,
  nextObjectName,
  spawnPosition,
  type ShapeType,
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

  const updateSettings: UpdateSettings = (group, changes) => {
    setSettings((previous) => ({
      ...previous,
      [group]: { ...previous[group], ...changes },
    }));
  };

  const updateObject: UpdateObject = (id, changes) => {
    setSettings((previous) => ({
      ...previous,
      objects: previous.objects.map((object) => (object.id === id ? { ...object, ...changes } : object)),
    }));
  };

  function addObject(type: ShapeType) {
    const object = createObject(type, {
      name: nextObjectName(type, settings.objects),
      position: spawnPosition(settings.objects.length),
    });
    setSettings((previous) => ({ ...previous, objects: [...previous.objects, object] }));
    setSelectedId(object.id); // select it, so the panel shows it straight away
  }

  function deleteObject(id: string) {
    setSettings((previous) => ({
      ...previous,
      objects: previous.objects.filter((object) => object.id !== id),
    }));
    setSelectedId((current) => (current === id ? null : current));
  }

  //leave performence mode when full screen ends or esc is pressed
  useEffect(() => {
    function onFullScreenChange(){
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

  function startPerforming() {
    setPerforming(true);
    document.documentElement.requestFullscreen().catch(() => {
      //fullscreen can be refused. still hide ui
    })
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
        <BabylonCanvas settings={settings} />

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