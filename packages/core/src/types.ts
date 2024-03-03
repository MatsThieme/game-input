import type { InputAxis } from "./InputAxis/InputAxis";
import type { InputButton } from "./InputButton/InputButton";
import type { InputAdapter } from "./InputAdapter";

type MappingType = Partial<Record<string, Record<string, string | number>>>;
type AdapterRecordType = Record<string, InputAdapter>;

export type GetAdapter<ButtonMapping, AxisMapping> = Record<
    keyof ButtonMapping & keyof AxisMapping & string,
    InputAdapter
>;

type Keys<T> = T extends Record<string, unknown> ? keyof T : never;

export type GetActionMappedTo<
    Adapters extends Record<string, InputAdapter>,
    Mapping extends MappingType,
> = Keys<Mapping[keyof Adapters & keyof Mapping]>;

export type MappedButtons<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]?: Record<string, Adapters[K] extends InputAdapter<infer X> ? X : never>;
};

export type MappedAxes<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]?: Record<
        string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Adapters[K] extends InputAdapter<infer _, infer X> ? X : never
    >;
};

type GetAdapterNamesForAction<Action extends string, Mapping extends MappingType> = string &
    keyof {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in keyof Mapping as Mapping[K] extends { [ZZZ in keyof Action]: any }
            ? Exclude<unknown, Mapping[K][Action]> extends never
                ? never
                : never
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              K]: Mapping[K] extends { [ZZZ in keyof Action]: any } ? Mapping[K][Action] : never;
    };

export type GetAdaptersForAction<
    Action extends string,
    Mapping extends MappingType,
    Adapters extends AdapterRecordType,
> = ReturnType<
    <T extends GetAdapterNamesForAction<Action, Mapping>>() => Adapters[T] extends never
        ? never
        : Adapters[T]
>;

export type GetInputButtonForAdapter<T extends InputAdapter> =
    T extends InputAdapter<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer X extends InputButton,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
    >
        ? X
        : never;

export type GetInputAxisForAdapter<T extends InputAdapter> =
    T extends InputAdapter<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer X extends InputAxis
    >
        ? X
        : never;

export type GetAdapterButtonActions<Adapter extends InputAdapter> =
    Adapter extends InputAdapter<
        infer X,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
    >
        ? X
        : never;
export type GetAdapterAxisActions<Adapter extends InputAdapter> =
    Adapter extends InputAdapter<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer X,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
    >
        ? X
        : never;
export type GetAdapterButton<Adapter extends InputAdapter> =
    Adapter extends InputAdapter<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer X,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
    >
        ? X
        : never;
export type GetAdapterAxis<Adapter extends InputAdapter> =
    Adapter extends InputAdapter<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        infer X
    >
        ? X
        : never;
