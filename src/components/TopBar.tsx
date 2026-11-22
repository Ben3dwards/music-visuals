import type { SceneMode } from "../scene/settings";

type Props = {
    mode: SceneMode;
    onModeChange: (mode: SceneMode) => void;
    listening: boolean;
    previewing: boolean;
    onStartAudio: () => void;
    onStopAudio: () => void;
    onTogglePreview: () => void;
    onResetView: () => void;
    onPerform: () => void;

}

export default function TopBar({ mode, onModeChange, listening, previewing, onStartAudio, onStopAudio, onTogglePreview, onResetView, onPerform }: Props) {
    return(
        <header className="absolute inset-x-0 top-0 grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-white/10 bg-black/60 px-4 text-sm text-white backdrop-blur">
            <span className="font-semibold tracking-wide">Music Visuals</span>
            

            <div className="flex gap-1 rounded bg-white/5 p-1">
                {(["scene", "wormhole"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onModeChange(option)}
                        className={`rounded px-3 py-1 capitalize ${mode === option ? "bg-white/20" : "text-white/60 hover:text-white"}`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button type="button" onClick={onResetView} className="rounded px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white">
                    Reset view
                </button>
                <button
                    type="button"
                    onClick={onTogglePreview}
                    title="See what the audience sees, without going fullscreen"
                    className={`rounded px-3 py-1.5 ${previewing ? "bg-white/20" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                >
                    Preview
                </button>

                {listening ? (
                    <button type="button" onClick={onStopAudio} className="flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 hover:bg-white/20">
                        <span className="h-2 w-2 rounded-full bg-green-400" />
                        Listening: stop
                    </button>
                ) : (
                    <button type="button" onClick={onStartAudio} className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/20">
                        Enable audio
                    </button>
                )}
                <button type="button" onClick={onPerform} className="rounded bg-pink-500/80 px-3 py-1.5 hover:bg-pink-500">
                    Perform
                </button>
            </div>
        </header>
    );
}