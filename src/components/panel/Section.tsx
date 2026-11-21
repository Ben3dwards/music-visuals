import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    onReset?: () => void;
};

export default function Section({ title, children, defaultOpen = false, onReset }: Props) {
    return (
        <details open={defaultOpen} className="group flex flex-col">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white/80">
                {title}
                    <span className="flex items-center gap-2">
                        {onReset && (
                        <button
                            type="button"
                            onClick={(e) => {
                            e.preventDefault();  // don't open/close the section
                            e.stopPropagation();
                            onReset();
                            }}
                            className="rounded px-1.5 text-[10px] font-normal normal-case tracking-normal text-white/40 hover:bg-white/10 hover:text-white"
                        >
                            Reset
                        </button>
                        )}
                    <span className="transition group-open:rotate-90">›</span>
                </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">{children}</div>
        </details>
    );
}