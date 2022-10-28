import { InputAxis } from "./InputAxis/InputAxis";
import { InputButton } from "./InputButton/InputButton";
import type { InputAdapter } from "./InputAdapter";

type GetAdapter<ButtonMapping, AxisMapping> = Record<
    keyof ButtonMapping & keyof AxisMapping & string,
    InputAdapter
>;

type Keys<T> = T extends Record<string, unknown> ? keyof T : never;

type GetActionMappedTo<
    Adapters extends Record<string, InputAdapter>,
    Mapping extends Record<string, Record<string, string | number>>
> = Keys<Mapping[keyof Adapters & keyof Mapping]>;

type MappedButtons<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]: Record<string, Adapters[K] extends InputAdapter<infer X> ? X : never>;
};

type MappedAxes<Adapters extends Record<string, InputAdapter>> = {
    [K in keyof Adapters]: Record<
        string,
        Adapters[K] extends InputAdapter<string | number, infer X> ? X : never
    >;
};

export class Input<
    ButtonMapping extends MappedButtons<Adapters>,
    AxisMapping extends MappedAxes<Adapters>,
    Adapters extends GetAdapter<ButtonMapping, AxisMapping>,
    ButtonActions extends GetActionMappedTo<Adapters, ButtonMapping>,
    AxisActions extends GetActionMappedTo<Adapters, AxisMapping>
> {
    private readonly _mappingButtons: Readonly<ButtonMapping>;
    private readonly _mappingAxes: Readonly<AxisMapping>;
    private readonly _adapters: Readonly<Adapters>;

    private readonly _frameInputButtonCache: Partial<
        Record<ButtonActions, InputButton | undefined>
    >;
    private readonly _frameInputAxisCache: Partial<Record<AxisActions, InputAxis | undefined>>;

    public constructor(
        adapters: Adapters,
        mappingButtons: ButtonMapping,
        mappingAxes: AxisMapping
    ) {
        this._mappingButtons = mappingButtons;
        this._mappingAxes = mappingAxes;
        this._adapters = adapters;

        this._frameInputButtonCache = {};
        this._frameInputAxisCache = {};

        for (const adapter in this._adapters) {
            this._adapters[adapter].initialize();
        }
    }

    public getAdapter<AdapterName extends keyof Adapters>(
        adapter: AdapterName
    ): Adapters[AdapterName] {
        return this._adapters[adapter];
    }

    /**
     * Returns an InputButton object mapped to the given input action.
     */
    public getButton<T extends InputButton>(action: ButtonActions): Readonly<T> {
        if (this._frameInputButtonCache[action]) {
            return this._frameInputButtonCache[action] as T;
        }

        let button: Readonly<InputButton> | undefined;

        for (const adapter in this._adapters) {
            const mappedTo = this._mappingButtons?.[adapter]?.[action];

            if (!mappedTo) continue;

            const buttonAdapter = this._adapters[adapter].getButton(mappedTo);

            if (!buttonAdapter) continue;

            if (buttonAdapter.down && buttonAdapter.click) {
                return buttonAdapter as T;
            } else if (buttonAdapter.down) {
                button = buttonAdapter;
            } else if (!button) {
                button = buttonAdapter;
            }
        }

        return (this._frameInputButtonCache[action] = (button as T) ?? new InputButton());
    }

    /**
     * Returns an InputAxis object mapped to the given InputAction.
     */
    public getAxis<T extends InputAxis>(action: AxisActions): Readonly<T> {
        if (this._frameInputAxisCache[action]) {
            return this._frameInputAxisCache[action] as T;
        }

        let axis: Readonly<InputAxis> | undefined;

        for (const adapter in this._adapters) {
            const mappedTo = this._mappingAxes?.[adapter]?.[action];

            if (!mappedTo) continue;

            const axisAdapter = this._adapters[adapter].getAxis(mappedTo);

            if (!axisAdapter) continue;

            if (!axis || axisAdapter.getLength() > axis.getLength()) {
                axis = axisAdapter;
            }
        }

        return (this._frameInputAxisCache[action] = (axis as T) ?? new InputAxis());
    }

    public update(): void {
        for (const adapter in this._adapters) {
            this._adapters[adapter].update();
        }

        this._clearCache();
    }

    private _clearCache() {
        for (const cached in this._frameInputButtonCache) {
            this._frameInputButtonCache[cached] = undefined;
        }

        for (const cached in this._frameInputAxisCache) {
            this._frameInputAxisCache[cached] = undefined;
        }
    }

    /**
     * Dispose all input adapters.
     */
    public dispose(): void {
        this._clearCache();

        for (const name in this._adapters) {
            this._adapters[name].dispose();
        }
    }
}

