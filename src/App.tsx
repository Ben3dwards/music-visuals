import { useEffect, useState } from "react";
import BabylonCanvas from "./components/BabylonCanvas";
import ControlPanel from "./components/ControlPanel";
import { audio } from "./audio/audioAnalyser";
import { defaultSettings, type UpdateSettings, type VisualSettings } from "./scene/settings";


export default function App() {
  const [settings, setSettings] = useState<VisualSettings>(defaultSettings);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performing, setPerforming] = useState(false);

  const updateSettings: UpdateSettings = (group, changes) => {
    setSettings((previous) => ({
    ...previous,
    [group]: { ...previous[group], ...changes },
    }));
  };

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
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {listening ? (
                <button onClick={handleStop} className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20">
                  Stop listening
                </button>
              ) : (
                <button onClick={handleStart} className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20">
                  Listen to system audio
                </button>
              )}
              <button onClick={startPerforming} className="rounded bg-pink-500/80 px-4 py-2 text-white hover:bg-pink-500">
                Perform
              </button>
              {error && <p className="max-w-xs text-sm text-red-400">{error}</p>}
            </div>

            <ControlPanel settings={settings} onChange={updateSettings} />
          </>
        )}
      </main>
  );
}