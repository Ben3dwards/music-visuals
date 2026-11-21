import { Select, type Option } from "./controls";
import BackgroundSection from "./panel/BackgroundSection";
import CameraSection from "./panel/CameraSection";
import LightingSection from "./panel/LightingSection";
import ReactionsSection from "./panel/ReactionsSection";
import ShapeSection from "./panel/ShapeSection";
import SmokeSection from "./panel/SmokeSection";
import SpectrumSection from "./panel/SpectrumSection";
import type { PanelSectionProps } from "./panel/shared";

export default function ControlPanel(props: PanelSectionProps) {
    const { settings, selectedId, onSelectObject } = props;

    //Temp object picker
    const objectOptions: Option<string>[] = [
        { value: "", label: "None" },
        ...settings.objects.map((object) => ({ value: object.id, label: object.name })),
    ];

    return (
        <aside className="absolute right-4 top-16 flex max-h-[calc(100vh-5rem)] w-72 flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-lg bg-black/60 p-4 text-white backdrop-blur [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
            <Select
                label="Editing"
                options={objectOptions}
                value={selectedId ?? ""}
                onChange={(id) => onSelectObject(id || null)}
            />
            <ShapeSection {...props} />
            <ReactionsSection {...props} />
            <LightingSection {...props} />
            <CameraSection {...props} />
            <SpectrumSection {...props} />
            <BackgroundSection {...props} />
            <SmokeSection {...props} />
        </aside>
    );
}