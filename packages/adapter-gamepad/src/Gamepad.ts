import type { InputAdapter } from "@game-input/core";
import { InputAxis, InputButton } from "@game-input/core";
import { GamepadAxis } from "./GamepadAxis";
import type { GamepadButton } from "./GamepadButton";

export class Gamepad<
    ActionMappedToButton extends GamepadButton = GamepadButton,
    ActionMappedToAxis extends GamepadAxis = GamepadAxis
> implements InputAdapter<ActionMappedToButton, ActionMappedToAxis>
{
    private readonly _index: number;
    private readonly _buttons: (InputButton | undefined)[];
    private readonly _axes: (InputAxis | undefined)[];

    private _gamepad: globalThis.Gamepad | null;

    public constructor(index: number) {
        this._index = index;
        this._buttons = [];
        this._axes = [];
        this._gamepad = null;

        this._onGamepadChange = this._onGamepadChange.bind(this);
    }

    public initialize(): void {
        this._onGamepadChange();

        window.addEventListener("gamepadconnected", this._onGamepadChange);
        window.addEventListener("gamepaddisconnected", this._onGamepadChange);
    }

    public getButton(button: ActionMappedToButton): Readonly<InputButton> | undefined {
        if (!this._buttons[button]) {
            this._buttons[button] = new InputButton();

            if (this._gamepad) {
                (this._buttons[button] as InputButton).setDown(
                    this._gamepad.buttons[button].pressed
                );
            }
        }

        return this._buttons[button];
    }

    public getAxis(axis: ActionMappedToAxis): Readonly<InputAxis> | undefined {
        if (!this._gamepad) {
            return;
        }

        this._setAxisAtIndex(axis);

        return this._axes[axis];
    }

    public update(): void {
        if (!this._gamepad) {
            return;
        }

        for (let i = 0; i < this._gamepad.buttons.length; i++) {
            this._buttons[i]?.setDown(this._gamepad.buttons[i].pressed);
            this._buttons[i]?.update();
        }

        for (let i = 0; i < this._axes.length; i++) {
            if (this._axes[i]) {
                this._setAxisAtIndex(i);
                (this._axes[i] as InputAxis).update();
            }
        }
    }

    /**
     * index > axes.length will return button.value (axes.length+1 == buttons[0].value)
     * uses standard mapping https://w3c.github.io/gamepad/#remapping
     */
    private _setAxisAtIndex(index: number): void {
        if (!this._gamepad) {
            return;
        }

        !this._axes[index] && (this._axes[index] = new InputAxis());

        const value = this._axes[index]?.getValues() as [number, ...number[]];

        // axes
        if (this._gamepad.axes[index] !== undefined) {
            if (index % 2 === 0) {
                this._gamepad.axes[index];
            } else {
                value[0] = -this._gamepad.axes[index];
            }
        }

        // buttons
        else if (index === GamepadAxis.LeftTrigger) {
            value[0] = this._gamepad.buttons[6].value;
        } else if (index === GamepadAxis.RightTrigger) {
            value[0] = this._gamepad.buttons[7].value;
        } else if (index === GamepadAxis.LeftStick) {
            value[0] = this._gamepad.axes[0];
            value[1] = -this._gamepad.axes[1];
        } else if (index === GamepadAxis.RightStick) {
            value[0] = this._gamepad.axes[2];
            value[1] = -this._gamepad.axes[3];
        }

        (this._axes[index] as InputAxis).setValues(value);
    }

    private _onGamepadChange(): void {
        this._gamepad = navigator.getGamepads()[this._index];

        this._gamepad?.mapping !== "standard" && (this._gamepad = null);
    }

    public dispose(): void {
        window.removeEventListener("gamepadconnected", this._onGamepadChange);
        window.removeEventListener("gamepaddisconnected", this._onGamepadChange);
    }
}
