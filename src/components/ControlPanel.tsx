import BackgroundSection from "./panel/BackgroundSection";
import EffectObjectSection from "./panel/EffectObjectSection";
import GroupSection from "./panel/GroupSection";
import ReactionsSection from "./panel/ReactionsSection";
import ShapeSection from "./panel/ShapeSection";
import { LIGHTING_CONTROLS } from "./panel/definitions";
import type { PanelSectionProps } from "./panel/shared";
import CameraSection from "./panel/CameraSection";
import WormholeSection from "./panel/WormholeSection";


export default function ControlPanel(props: PanelSectionProps) {
    const hasSelection = props.settings.objects.some((object) => object.id === props.selectedId);

    
    return (
        <aside className="absolute right-4 top-16 flex max-h-[calc(100vh-5rem)] w-72 flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-lg bg-black/60 p-4 text-white backdrop-blur [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
            {hasSelection ? (
                <>
                    <ShapeSection {...props} />
                    <ReactionsSection {...props} />
                    <EffectObjectSection {...props} />
                </>
            ) : (
                <>
                    <WormholeSection {...props} />
                    <GroupSection {...props} group="lighting" title="Lighting" controls={LIGHTING_CONTROLS} />
                    <CameraSection {...props} />
                    <BackgroundSection {...props} />
                </>
            )}
        </aside>
    );
}