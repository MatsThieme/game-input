import { InputAdapter } from "./InputAdapter";
import type { InputAxis } from "./InputAxis/InputAxis";
import type { InputButton } from "./InputButton/InputButton";
import type {
    GetActionMappedTo,
    GetAdapter,
    GetAdapterAxis,
    GetAdapterAxisActions,
    GetAdapterButton,
    GetAdapterButtonActions,
    GetAdaptersForAction,
    GetInputAxisForAdapter,
    GetInputButtonForAdapter,
    MappedAxes,
    MappedButtons,
} from "./types";

export const enum InputState {
    ready = "ready",
    disposed = "disposed",
}

type AdapterFactories<Adapters> = { [K in keyof Adapters]: () => Adapters[K] };

export class Input<
    ButtonMapping extends MappedButtons<Adapters>,
    AxisMapping extends MappedAxes<Adapters>,
    Adapters extends GetAdapter<ButtonMapping, AxisMapping>,
    ButtonActions extends GetActionMappedTo<Adapters, ButtonMapping>,
    AxisActions extends GetActionMappedTo<Adapters, AxisMapping>,
> {
    private readonly _mappingButtons: Readonly<ButtonMapping>;
    private readonly _mappingAxes: Readonly<AxisMapping>;
    private readonly _adapterFactories: AdapterFactories<Adapters>;
    private readonly _adapters: Adapters;

    private readonly _frameInputButtonCache: Partial<Record<string, Readonly<InputButton>>>;
    private readonly _frameInputAxisCache: Partial<Record<string, InputAxis>>;

    private _state: InputState = InputState.ready;

    public constructor(
        adapters: AdapterFactories<Adapters>,
        mappingButtons: ButtonMapping,
        mappingAxes: AxisMapping,
    ) {
        this._mappingButtons = mappingButtons;
        this._mappingAxes = mappingAxes;
        this._adapterFactories = adapters;
        this._adapters = this._createAdapters();

        this._frameInputButtonCache = {};
        this._frameInputAxisCache = {};
    }

    /**
     * Returns an InputButton object mapped to the given input action.
     */
    public getButton<
        T extends ButtonActions,
        U extends GetInputButtonForAdapter<GetAdaptersForAction<T, ButtonMapping, Adapters>>,
    >(action: T): Readonly<U> | undefined {
        if (!this._checkState()) {
            return;
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

    public getAdapterButton<
        AdapterName extends keyof Adapters & string,
        ActionName extends GetAdapterButtonActions<Adapters[AdapterName]>,
        AdapterButton extends GetAdapterButton<Adapters[AdapterName]>,
    >(adapter: AdapterName, action: ActionName): AdapterButton | undefined {
        if (!this._checkState()) {
            return;
        }

        const cacheKey = adapter + "." + action;

        if (this._frameInputButtonCache[cacheKey]) {
            return this._frameInputButtonCache[cacheKey] as AdapterButton;
        }

        const adapterButton = this._adapters[adapter].getButton(action) as
            | AdapterButton
            | undefined;

        this._frameInputButtonCache[cacheKey] = adapterButton;

        return adapterButton;
    }

    /**
     * Returns an InputAxis object mapped to the given InputAction.
     */
    public getAxis<
        T extends AxisActions,
        U extends GetInputAxisForAdapter<GetAdaptersForAction<T, AxisMapping, Adapters>>,
    >(action: T): Readonly<U> | undefined {
        if (!this._checkState()) {
            return;
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

    public getAdapterAxis<
        AdapterName extends keyof Adapters & string,
        ActionName extends GetAdapterAxisActions<Adapters[AdapterName]>,
        AdapterAxis extends GetAdapterAxis<Adapters[AdapterName]>,
    >(adapter: AdapterName, action: ActionName): AdapterAxis | undefined {
        if (!this._checkState()) {
            return;
        }

        const cacheKey = adapter + "." + action;

        if (this._frameInputAxisCache[cacheKey]) {
            return this._frameInputAxisCache[cacheKey] as AdapterAxis;
        }

        const adapterAxis = this._adapters[adapter].getAxis(action) as AdapterAxis | undefined;

        this._frameInputAxisCache[cacheKey] = adapterAxis;

        return adapterAxis;
    }

    public update(): void {
        if (!this._checkState()) {
            return;
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

    private _createAdapters(): Adapters {
        const adapters: Partial<Adapters> = {};

        for (const adapter in this._adapterFactories) {
            adapters[adapter] = this._adapterFactories[adapter]();
        }

        return adapters as Adapters;
    }

    private _checkState(): boolean {
        const disposed = this._state === InputState.disposed;

        if (disposed) {
            console.error(
                "Input is unusable because it was disposed with `input.dispose()`. Create a new instance.",
            );
        }

        return !disposed;
    }

    /**
     * Dispose all input adapters.
     */
    public dispose(): void {
        this._state = InputState.disposed;

        this._clearCache();

        for (const name in this._adapters) {
            this._adapters[name].dispose();
        }
    }
}
