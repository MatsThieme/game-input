import type { InputAdapter } from "@game-input/core";
import { InputAxis, InputButton } from "@game-input/core";
import type { TouchAxis } from "./TouchAxis";
import type { TouchButton } from "./TouchButton";

type TouchRecord = {
    id: number;
    valid: number;
    button: InputButton;
    axis: InputAxis;
};

export class Touch<
    ActionMappedToButton extends TouchButton = TouchButton,
    ActionMappedToAxis extends TouchAxis = TouchAxis,
> implements InputAdapter<ActionMappedToButton, ActionMappedToAxis, InputButton, InputAxis>
{
    private readonly _touches: TouchRecord[];

    private readonly _invalidateAfterUpdates: number;
    private _element: HTMLElement;

    /**
     * @param {number} [invalidateAfterUpdates=5] The number of updates before a unused touch-point is considered invalid.
     * @param {HTMLElement} [element=document.body] The dom element to listen for touch events.
     */
    public constructor(invalidateAfterUpdates: number = 5, element: HTMLElement = document.body) {
        this._invalidateAfterUpdates = invalidateAfterUpdates;
        this._element = element;

        this._touches = [];

        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._element.addEventListener("touchstart", this._onTouchStart);
        this._element.addEventListener("touchmove", this._onTouchMove);
        this._element.addEventListener("touchend", this._onTouchEnd);
    }

    public dispose(): void {
        this._element.removeEventListener("touchstart", this._onTouchStart);
        this._element.removeEventListener("touchmove", this._onTouchMove);
        this._element.removeEventListener("touchend", this._onTouchEnd);
    }

    public getButton(button: ActionMappedToButton): Readonly<InputButton> | undefined {
        if (this._touches[button] && this._touches[button].valid > 0) {
            return this._touches[button].button;
        }
    }

    /**
     * The input axis returned contains position values.
     */
    public getAxis(axis: ActionMappedToAxis): Readonly<InputAxis> | undefined {
        if (this._touches[axis] && this._touches[axis].valid > 0) {
            return this._touches[axis].axis;
        }
    }

    public update(): void {
        for (let i = 0; i < this._touches.length; i++) {
            if (this._touches[i] && this._touches[i].valid > 0) {
                if (this._touches[i].valid <= this._invalidateAfterUpdates) {
                    this._touches[i].valid--;
                }

                this._touches[i].button.update();
                this._touches[i].axis.update();
            }
        }
    }

    private _onTouchStart(event: Pick<TouchEvent, "changedTouches">): void {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const { identifier, pageX, pageY } = event.changedTouches[i];

            let touchRecordIndex = -1;
            let overrideTouchIndex = -1;

            for (let i = 0; i < this._touches.length; i++) {
                if (this._touches[i].id === identifier) {
                    touchRecordIndex = i;
                    break;
                }

                if (this._touches[i].valid <= this._invalidateAfterUpdates) {
                    overrideTouchIndex = i;
                }

                if (touchRecordIndex !== -1 && overrideTouchIndex !== -1) {
                    break;
                }
            }

            if (touchRecordIndex !== -1) {
                this._touches[touchRecordIndex].id = identifier;
                this._touches[touchRecordIndex].valid = this._invalidateAfterUpdates + 1;
                this._touches[touchRecordIndex].axis.setValues([pageX, pageY]);
                this._touches[touchRecordIndex].button.setDown(false);
            } else {
                if (overrideTouchIndex === -1) {
                    this._touches.push({
                        id: identifier,
                        valid: this._invalidateAfterUpdates + 1,
                        button: new InputButton(),
                        axis: new InputAxis([pageX, pageY]),
                    });
                } else {
                    this._touches[overrideTouchIndex].id = identifier;
                    this._touches[overrideTouchIndex].valid = this._invalidateAfterUpdates + 1;
                    this._touches[overrideTouchIndex].axis.setValues([pageX, pageY]);
                    this._touches[overrideTouchIndex].button.setDown(false);
                }
            }
        }
    }

    private _onTouchMove(event: Pick<TouchEvent, "changedTouches">): void {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const { identifier, pageX, pageY } = event.changedTouches[i];

            for (let i = 0; i < this._touches.length; i++) {
                if (this._touches[i].id === identifier) {
                    const values = this._touches[i].axis.getValues() as [number, ...number[]];

                    values.push(pageX, pageY);

                    this._touches[i].axis.setValues(values);

                    break;
                }
            }
        }
    }

    private _onTouchEnd(event: Pick<TouchEvent, "changedTouches">): void {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const { identifier, pageX, pageY } = event.changedTouches[i];

            for (let i = 0; i < this._touches.length; i++) {
                if (this._touches[i].id === identifier) {
                    this._touches[i].button.setDown(false);

                    const values = this._touches[i].axis.getValues() as [number, ...number[]];
                    values.push(pageX, pageY);
                    this._touches[i].axis.setValues(values);

                    this._touches[i].valid--;

                    break;
                }
            }
        }
    }
}
