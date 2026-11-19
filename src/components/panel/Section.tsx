import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};

export default function Section({ title, children, defaultOpen = false }: Props) {
    return (
        <details open={defaultOpen} className="group flex flex-col">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white/80">
                {title}
                <span className="transition group-open:rotate-90">›</span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">{children}</div>
        </details>
    );
}