import type { Reaction } from "../../scene/reactions";
import type { Option } from "../controls";

export type KeysOfType<T, V> = {
      [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T] & string;

type Base<T> = {
    label: string;
    disabled?: (value: T) => boolean;
};

export type ControlDef<T> =
  | (Base<T> & { type: "slider"; key: KeysOfType<T, number>; min: number; max: number; step: number })
  | (Base<T> & { type: "toggle"; key: KeysOfType<T, boolean> })
  | (Base<T> & { type: "colour"; key: KeysOfType<T, string> })
  | (Base<T> & { type: "buttons"; key: KeysOfType<T, string>; options: Option<string>[] })
  | (Base<T> & { type: "reaction"; key: KeysOfType<T, Reaction>; minAmount?: number });