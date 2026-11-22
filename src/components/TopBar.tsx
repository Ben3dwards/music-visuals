type Props = {
    listening: boolean;
    previewing: boolean;
    onStartAudio: () => void;
    onStopAudio: () => void;
    onTogglePreview: () => void;
    onResetView: () => void;
    onPerform: () => void;

}

export default function TopBar({ listening, previewing, onStartAudio, onStopAudio, onTogglePreview, onResetView, onPerform }: Props) {
    return(
        <header className="absolute inset-x-0 top-0 flex h-12 items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-4 text-sm text-white backdrop-blur">
            <span className="font-semibold tracking-wide">Music Visuals</span>
            
            {/* Mode switch to wormhole section - comes later */}

            <div className="flex gap-1 rounded bg-white/5 p-1">
                <button type="button" className="rounded bg-white/20 px-3 py-1">
                    Scene
                </button>
                <button type="button" disabled title="Coming soon" className="cursor-not-allowed rounded px-3 py-1 text-white/30">
                    Wormhole
                </button>
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