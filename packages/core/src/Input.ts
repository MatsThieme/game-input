import type { InputAxis } from "./InputAxis/InputAxis";
import type { InputButton } from "./InputButton/InputButton";
import type {
    GetActionMappedTo,
    GetAdapter,
    GetAdaptersForAction,
    GetInputAxisForAdapter,
    GetInputButtonForAdapter,
    MappedAxes,
    MappedButtons,
} from "./types";

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

    private readonly _frameInputButtonCache: Partial<Record<ButtonActions, Readonly<InputButton>>>;
    private readonly _frameInputAxisCache: Partial<Record<AxisActions, InputAxis>>;

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
    public getButton<
        T extends ButtonActions,
        U extends GetInputButtonForAdapter<GetAdaptersForAction<T, ButtonMapping, Adapters>>
    >(action: T): Readonly<U> {
        if (this._frameInputButtonCache[action]) {
            return this._frameInputButtonCache[action] as U;
        }

        let button: Readonly<U> | undefined;

        for (const adapter in this._adapters) {
            const mappedTo = this._mappingButtons[adapter]?.[action];

            if (!mappedTo) {
                continue;
            }

            const buttonAdapter = this._adapters[adapter].getButton(mappedTo) as U | undefined;

            if (!buttonAdapter) {
                continue;
            }

            if (buttonAdapter.click) {
                return buttonAdapter;
            } else if (buttonAdapter.down) {
                button = buttonAdapter;
            } else if (!button) {
                button = buttonAdapter;
            }
        }

        if (!button) {
            throw new Error("No adapter returned an InputButton");
        }

        return (this._frameInputButtonCache[action] = button);
    }

    /**
     * Returns an InputAxis object mapped to the given InputAction.
     */
    public getAxis<
        T extends AxisActions,
        U extends GetInputAxisForAdapter<GetAdaptersForAction<T, AxisMapping, Adapters>>
    >(action: T): Readonly<U> {
        if (this._frameInputAxisCache[action]) {
            return this._frameInputAxisCache[action] as U;
        }

        let axis: Readonly<U> | undefined;

        for (const adapter in this._adapters) {
            const mappedTo = this._mappingAxes[adapter]?.[action];

            if (!mappedTo) {
                continue;
            }

            const axisAdapter = this._adapters[adapter].getAxis(mappedTo) as U | undefined;

            if (!axisAdapter) {
                continue;
            }

            if (!axis || axisAdapter.getLength() > axis.getLength()) {
                axis = axisAdapter;
            }
        }

        if (!axis) {
            throw new Error("No adapter returned an InputAxis");
        }

        return (this._frameInputAxisCache[action] = axis as unknown as InputAxis) as U; // TODO: fix type
    }

    public update(): void {
        for (const adapter in this._adapters) {
            this._adapters[adapter].update();
        }

        this._clearCache();
    }

    private _clearCache(): void {
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
