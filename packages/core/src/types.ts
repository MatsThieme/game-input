import type { InputAxis } from "./InputAxis/InputAxis";
import type { InputButton } from "./InputButton/InputButton";
import type { InputAdapter } from "./InputAdapter";

type MappingType = Record<string, Record<string, string | number>>;
type AdapterRecordType = Record<string, InputAdapter>;

export type GetAdapter<ButtonMapping, AxisMapping> = Record<
    keyof ButtonMapping & keyof AxisMapping & string,
    InputAdapter
>;

type Keys<T> = T extends Record<string, unknown> ? keyof T : never;

export type GetActionMappedTo<
    Adapters extends Record<string, InputAdapter>,
    Mapping extends MappingType
> = Keys<Mapping[keyof Adapters & keyof Mapping]>;

export type MappedButtons<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]: Record<string, Adapters[K] extends InputAdapter<infer X> ? X : never>;
};

export type MappedAxes<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]: Record<
        string,
        Adapters[K] extends InputAdapter<string | number, infer X> ? X : never
    >;
};

type GetAdapterNamesForAction<Action extends string, Mapping extends MappingType> = string &
    keyof {
        [K in keyof Mapping as Exclude<unknown, Mapping[K][Action]> extends never
            ? never
            : K]: Mapping[K][Action];
    };

export type GetAdaptersForAction<
    Action extends string,
    Mapping extends MappingType,
    Adapters extends AdapterRecordType
> = ReturnType<
    <T extends GetAdapterNamesForAction<Action, Mapping>>() => Adapters[T] extends never
        ? never
        : Adapters[T]
>;

export type GetInputButtonForAdapter<T extends InputAdapter> = T extends InputAdapter<
    any,
    any,
    infer X extends InputButton,
    any
>
    ? X
    : never;

export type GetInputAxisForAdapter<T extends InputAdapter> = T extends InputAdapter<
    any,
    any,
    any,
    infer X extends InputAxis
>
    ? X
    : never;
