import { BACKGROUND_IMAGES } from "../../scene/backgroundImages";
import { ButtonGroup, ColourPicker, FileButton, Select, Slider, type Option } from "../controls";
import Section from "./Section";
import { BACKGROUND_MODE_OPTIONS, type PanelSectionProps } from "./shared";
import { defaultSettings } from "../../scene/settings";

export default function BackgroundSection({ settings, onChange }: PanelSectionProps) {
    const { background } = settings;

    //Built in and uploaded images
    const isCustomImage = !BACKGROUND_IMAGES.some((image) => image.url === background.imageUrl);
    const imageOptions: Option<string>[] = [
        ...BACKGROUND_IMAGES.map(({ label, url }) => ({ value: url, label })),
        ...(isCustomImage ? [{ value: background.imageUrl, label: "Your image" }] : []),
    ];

    function uploadBackground(file: File) {
        if (background.imageUrl.startsWith("blob:")) URL.revokeObjectURL(background.imageUrl);
        onChange("background", { mode: "image", imageUrl: URL.createObjectURL(file) });
    }

    return(
        <Section title="Background" onReset={() => onChange("background", defaultSettings.background)}>
            <ButtonGroup
                label="Type"
                options={BACKGROUND_MODE_OPTIONS}
                value={background.mode}
                onChange={(mode) => onChange("background", { mode })}
            />
            <ColourPicker
                label="Colour"
                value={background.colour}
                onChange={(colour) => onChange("background", { colour })}
            />
            {background.mode === "image" && (
                <>
                <Select
                    label="Image"
                    options={imageOptions}
                    value={background.imageUrl}
                    onChange={(imageUrl) => onChange("background", { imageUrl })}
                />
                <FileButton label="Upload your own…" accept="image/*" onFile={uploadBackground} />
                <Slider
                    label="Brightness"
                    value={background.brightness}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(brightness) => onChange("background", { brightness })}
                />
                <Slider
                    label="Spin"
                    value={background.spin}
                    min={-2}
                    max={2}
                    step={0.05}
                    onChange={(spin) => onChange("background", { spin })}
                />
                </>
            )}
        </Section>
    );
}
