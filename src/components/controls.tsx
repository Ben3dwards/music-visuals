type SliderProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    disabled?: boolean;
};

export function Slider({ label, value, min, max, step, onChange, disabled }: SliderProps) {
    return (
        <label className="flex flex-col gap-1 text-sm">
            <span className="flex justify-between text-white/70">
            {label}
            <span className="tabular-nums text-white">{value.toFixed(2)}</span>
            </span>
            <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="accent-pink-500 disabled:opacity-40"
            />
        </label>
    );
}

type ColourPickerProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export function ColourPicker({ label, value, onChange, disabled }: ColourPickerProps) {
    return (
        <label className="flex items-center justify-between text-sm text-white/70">
            {label}
            <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-white/20 bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
            />
        </label>
    );
}


type ToggleProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export function Toggle({ label, checked, onChange }: ToggleProps) {
    return (
        <label className="flex items-center justify-between text-sm text-white/70">
            {label}
            <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-pink-500"
            />
        </label>
    );
}

type Option<T extends string> = { value: T; label: string };

type ButtonGroupProps<T extends string> = {
    label: string;
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
};

export function ButtonGroup<T extends string>({ label, options, value, onChange }: ButtonGroupProps<T>) {
    return (
        <div className="flex flex-col gap-1 text-sm">
            <span className="text-white/70">{label}</span>
            <div className="flex gap-1 rounded bg-white/5 p-1">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`flex-1 rounded px-2 py-1 transition ${
                            option.value === value ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                        }`}
                        >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
    }