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

    private _initialized = false;

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
    }

    public initialize(): void {
        if (this._initialized) {
            console.warn("Input.initialize: Input is already initialized");
        }

        for (const adapter in this._adapters) {
            this._adapters[adapter].initialize();
        }

        this._initialized = true;
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
    >(action: T): Readonly<U> | undefined {
        if (!this._initialized) {
            console.warn("Input.getButton: Input is not initialized");
        }

        if (this._frameInputButtonCache[action]) {
            return this._frameInputButtonCache[action] as U;
        }

        let button: Readonly<U> | undefined;

        for (const adapter in this._adapters) {
            const adapterMapping = this._mappingButtons[adapter];

            if (!adapterMapping) {
                continue;
            }

            const mappedTo = adapterMapping[action];

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
            return;
        }

        return (this._frameInputButtonCache[action] = button);
    }

    /**
     * Returns an InputAxis object mapped to the given InputAction.
     */
    public getAxis<
        T extends AxisActions,
        U extends GetInputAxisForAdapter<GetAdaptersForAction<T, AxisMapping, Adapters>>
    >(action: T): Readonly<U> | undefined {
        if (!this._initialized) {
            console.warn("Input.getAxis: Input is not initialized");
        }

        if (this._frameInputAxisCache[action]) {
            return this._frameInputAxisCache[action] as U;
        }

        let axis: Readonly<U> | undefined;

        for (const adapter in this._adapters) {
            const adapterMapping = this._mappingAxes[adapter];

            if (!adapterMapping) {
                continue;
            }

            const mappedTo = adapterMapping[action];

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
            return;
        }

        return (this._frameInputAxisCache[action] = axis as unknown as InputAxis) as U; // TODO: fix type
    }

    public update(): void {
        if (!this._initialized) {
            console.warn("Input.update: Input is not initialized");
        }

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
        if (!this._initialized) {
            console.warn("Input.dispose: Input is not initialized");
        }

        this._clearCache();

        for (const name in this._adapters) {
            this._adapters[name].dispose();
        }

        this._initialized = false;
    }
}
