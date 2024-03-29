import type { InputAdapter } from "@game-input/core";
import { InputAxis, InputButton } from "@game-input/core";
import { MouseAxis } from "./MouseAxis";
import type { MouseButton } from "./MouseButton";

export class Mouse<
    ActionMappedToButton extends MouseButton = MouseButton,
    ActionMappedToAxis extends MouseAxis = MouseAxis,
> implements InputAdapter<ActionMappedToButton, ActionMappedToAxis>
{
    private readonly _element: HTMLElement;

    private readonly _buttons: (InputButton | undefined)[];
    private readonly _axes: {
        [MouseAxis.Position]: InputAxis;
        [MouseAxis.PositionHorizontal]: InputAxis;
        [MouseAxis.PositionVertical]: InputAxis;
        [MouseAxis.Movement]: InputAxis;
    };

    private _mouseMovedThisFrame = false;

    /**
     * @param {HTMLElement} [element=document.body] element to attach event listeners to
     */
    public constructor(element: HTMLElement = document.body) {
        this._element = element;

        this._buttons = [];
        this._axes = {
            [MouseAxis.Position]: new InputAxis([0, 0]),
            [MouseAxis.PositionHorizontal]: new InputAxis(0),
            [MouseAxis.PositionVertical]: new InputAxis(0),
            [MouseAxis.Movement]: new InputAxis([0, 0]),
        };

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._element.addEventListener("mousedown", this._onMouseDown);
        this._element.addEventListener("mouseup", this._onMouseUp);
        this._element.addEventListener("mousemove", this._onMouseMove);
    }

    public getButton(button: ActionMappedToButton): Readonly<InputButton> | undefined {
        return this._buttons[button];
    }

    public getAxis(axis: ActionMappedToAxis): Readonly<InputAxis> | undefined {
        return this._axes[axis];
    }

    public update(): void {
        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i]?.update();
        }

        this._axes[MouseAxis.Position].update();
        this._axes[MouseAxis.PositionHorizontal].update();
        this._axes[MouseAxis.PositionVertical].update();

        if (this._axes[MouseAxis.Movement]) {
            this._axes[MouseAxis.Movement].update();

            if (!this._mouseMovedThisFrame) {
                this._axes[MouseAxis.Movement].setValues([0, 0]);
            } else {
                this._mouseMovedThisFrame = false;
            }
        }
    }

    private _onMouseMove(event: MouseEvent): void {
        event.stopPropagation();

        if (!this._mouseMovedThisFrame) {
            const posX = event.clientX;
            const posY = event.clientY;

            const [prevPosX, prevPosY] = this._axes[MouseAxis.Position].getValues();

            if (prevPosX !== 0 && prevPosY !== 0) {
                const [deltaMoveX, deltaMoveY] = [posX - prevPosX, posY - prevPosY];

                this._axes[MouseAxis.Movement].setValues([deltaMoveX, deltaMoveY]);
            }

            this._setPosition(posX, posY);

            this._mouseMovedThisFrame = true;
        }
    }

    private _onMouseUp(event: MouseEvent): void {
        event.stopPropagation();

        if (!this._buttons[event.button]) {
            this._buttons[event.button] = new InputButton();
        }

        (this._buttons[event.button] as InputButton).setDown(false);
    }

    private _onMouseDown(event: MouseEvent): void {
        event.stopPropagation();

        if (!this._buttons[event.button]) {
            this._buttons[event.button] = new InputButton();
        }

        (this._buttons[event.button] as InputButton).setDown(true);
    }

    private _setPosition(x: number, y: number): void {
        const position = this._axes[MouseAxis.Position].getValues();

        if (position[0] !== x || position[1] !== y) {
            this._axes[MouseAxis.Position].setValues([x, y]);

            if (position[0] !== x) {
                this._axes[MouseAxis.PositionHorizontal].setValues([x]);
            }

            if (position[1] !== y) {
                this._axes[MouseAxis.PositionVertical].setValues([y]);
            }
        }
    }

    public dispose(): void {
        this._element.removeEventListener("mousedown", this._onMouseDown);
        this._element.removeEventListener("mouseup", this._onMouseUp);
        this._element.removeEventListener("mousemove", this._onMouseMove);
    }
}
