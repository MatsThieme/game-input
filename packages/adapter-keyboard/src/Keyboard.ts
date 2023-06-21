import type { InputAdapter } from "@game-input/core";
import { InputAxis, InputButton } from "@game-input/core";
import type { KeyboardAxis } from "./KeyboardAxis";
import { KeyboardButton } from "./KeyboardButton";

export class Keyboard<
    ActionMappedToButton extends KeyboardButton = KeyboardButton,
    ActionMappedToAxis extends KeyboardAxis = KeyboardAxis
> implements InputAdapter<ActionMappedToButton, ActionMappedToAxis>
{
    private readonly _element: HTMLElement;

    private readonly _keys: Partial<Record<KeyboardButton, InputButton>>;
    private readonly _axes: Partial<Record<KeyboardAxis, InputAxis>>;
    private readonly _axesParsedCache: Partial<
        Record<KeyboardAxis, [KeyboardButton, KeyboardButton]>
    >;

    /**
     * @param element element for attaching event listeners to
     */
    public constructor(element: HTMLElement = document.body) {
        this._element = element;

        this._keys = {};
        this._axes = {};
        this._axesParsedCache = {};

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
    }

    public initialize(): void {
        this._resetValues();

        this._element.addEventListener("keydown", this._onKeyDown);
        this._element.addEventListener("keyup", this._onKeyUp);
    }

    public getButton(button: ActionMappedToButton): Readonly<InputButton> {
        return this._keys[button] ?? (this._keys[button] = new InputButton());
    }

    public getAxis(axis: ActionMappedToAxis): Readonly<InputAxis> | undefined {
        if (this._axes[axis]) {
            return this._axes[axis];
        }

        const keys = this._axisToKeys(axis);

        if (keys) {
            const b0 = this.getButton(keys[0] as ActionMappedToButton);
            const b1 = this.getButton(keys[1] as ActionMappedToButton);

            if (!this._axes[axis]) {
                this._axes[axis] = new InputAxis((b1.down ? 1 : 0) - (b0.down ? 1 : 0));
            }

            return this._axes[axis];
        }

        return;
    }

    private _onKeyDown(event: KeyboardEvent): void {
        let btn = this._keys[event.code as KeyboardButton];

        if (!btn) {
            this._keys[event.code as KeyboardButton] = btn = new InputButton();
        }

        btn.setDown(true);
    }

    private _onKeyUp(event: KeyboardEvent): void {
        let btn = this._keys[<KeyboardButton>event.code];

        if (!btn) {
            btn = new InputButton();
            this._keys[event.code as KeyboardButton] = btn;
        }

        btn.setDown(false);
    }

    private _axisToKeys(axis: KeyboardAxis): [KeyboardButton, KeyboardButton] | undefined {
        if (axis in this._axesParsedCache) {
            return this._axesParsedCache[axis];
        }

        const keys: [KeyboardButton, KeyboardButton] | undefined = axis
            .match(/^Axis\((\w+), (\w+)\)$/)
            ?.slice(1) as [KeyboardButton, KeyboardButton];

        if (!keys || keys.length < 2 || !KeyboardButton[keys[0]] || !KeyboardButton[keys[1]]) {
            return;
        }

        return (this._axesParsedCache[axis] = keys);
    }

    public update(): void {
        for (const button in this._keys) {
            (this._keys[button as KeyboardButton] as InputButton).update();
        }

        for (const axis in this._axes) {
            const buttons = this._axisToKeys(axis as KeyboardAxis);

            if (buttons) {
                (this._axes[axis as KeyboardAxis] as InputAxis).setValues([
                    this.getButton(buttons[0] as ActionMappedToButton).down ? 1 : 0,
                    this.getButton(buttons[1] as ActionMappedToButton).down ? 1 : 0,
                ]);
            }

            (this._axes[axis as KeyboardAxis] as InputAxis).update();
        }
    }

    public dispose(): void {
        this._element.removeEventListener("keydown", this._onKeyDown);
        this._element.removeEventListener("keyup", this._onKeyUp);

        this._resetValues();
    }

    private _resetValues(): void {
        for (const button in this._keys) {
            (this._keys[button as KeyboardButton] as InputButton).setDown(false);
            (this._keys[button as KeyboardButton] as InputButton).update();
        }

        for (const axis in this._axes) {
            (this._axes[axis as KeyboardAxis] as InputAxis).setValues(
                (this._axes[axis as KeyboardAxis] as InputAxis).getValues().map(() => 0) as [
                    number,
                    ...number[]
                ]
            );
        }
    }
}
