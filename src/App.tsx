import { useState } from "react";
import BabylonCanvas from "./components/BabylonCanvas";
import { audio } from "./audio/audioAnalyser";
import { defaultSettings, type VisualSettings } from "./scene/settings";

export default function App(){
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings] = useState<VisualSettings>(defaultSettings);

  async function handleStart() {
    setError(null);
    try{
      await audio.startSystemAudio(() => setListening(false));
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start audio");
    }
  }

  function handleStop(){
    audio.stop();
    setListening(false);
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <BabylonCanvas settings={settings} />
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
        {error && <p className="max-w-xs text-sm text-red-400">{error}</p>}
      </div>
    </main>
  )
}