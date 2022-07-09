export class InputButton {
    private _isSetDown: boolean | undefined;
    private _down: boolean;
    private _wasDown: boolean;

    /**
     * Store state information of a button.
     */
    public constructor() {
        this._isSetDown = false;
        this._down = false;
        this._wasDown = false;
    }

    /**
     * Returns whether the button was down in the last frame.
     */
    public get down(): boolean {
        return this._down;
    }

    /**
     * Returns whether the button was down in the second last frame.
     */
    public get wasDown(): boolean {
        return this._wasDown;
    }

    /**
     * Returns whether the button was down in the last frame and was not down in the second last frame.
     */
    public get click(): boolean {
        return this._down && !this._wasDown;
    }

    /**
     * Returns whether the button was down in the last and second last frame.
     */
    public get clicked(): boolean {
        return this._down && this._wasDown;
    }

    /**
     * @internal
     */
    public setDown(down: boolean): void {
        this._isSetDown = down;
    }

    /**
     * @internal
     */
    public update(): void {
        this._wasDown = this._down;

        if (this._isSetDown !== undefined) this._down = this._isSetDown;

        this._isSetDown = undefined;
    }
}
