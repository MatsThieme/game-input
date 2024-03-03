import type { InputAxis } from "./InputAxis/InputAxis";
import type { InputButton } from "./InputButton/InputButton";

/**
 * InputAdapters should always cache their InputButtons and InputAxes between updates
 */
export interface InputAdapter<
    ActionMappedToButton extends string | number = string | number,
    ActionMappedToAxis extends string | number = string | number,
    AdapterInputButton extends InputButton = InputButton,
    AdapterInputAxis extends InputAxis = InputAxis,
> {
    /**
     * Get an InputButton object for the specified input of the corresponding adapter.
     *
     * @param key a unique identifier for an input.
     */
    getButton(key: ActionMappedToButton): Readonly<AdapterInputButton> | undefined;

    /**
     * Get an InputAxis object for the specified input of the corresponding adapter.
     *
     * @param key a unique identifier for an input.
     */
    getAxis(key: ActionMappedToAxis): Readonly<AdapterInputAxis> | undefined;

    /**
     * @internal
     * Called once per frame.
     */
    update(): void;

    /**
     * @internal
     * Prepare the InputAdapter for disposal by removing listeners or clearing references to InputButtons/-Axis.
     */
    dispose(): void;
}
