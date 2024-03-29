type NumberTuple = [...number[]];

export class InputAxis<T extends NumberTuple = NumberTuple> {
    private _values: T;
    private _length: number | undefined;
    private _changed: number;

    public constructor(values?: number | T) {
        if (values === undefined) {
            this._values = [0] as unknown as T;
        } else if (typeof values === "number") {
            this._values = [values] as unknown as T;
        } else {
            this._values = values.slice() as T;
        }

        this._changed = 0;
    }

    /**
     * Returns whether values changed in the last frame.
     */
    public get changed(): boolean {
        return this._changed === 1;
    }

    public getValues(): Readonly<T> {
        return this._values;
    }

    /**
     * @internal
     */
    public setValues(values: Readonly<T>): void {
        if (
            this._values.length !== values.length ||
            this._values.some((value, index) => value !== values[index])
        ) {
            this._values = values.slice() as T;

            this._length !== undefined && (this._length = undefined);
            this._changed = 2;
        }
    }

    /**
     * @internal
     */
    public update(): void {
        this._changed > 0 && this._changed--;
    }

    public getLength(): number {
        if (typeof this._length === "number") {
            return this._length;
        }

        if (this._values.length === 1) {
            return (this._length = this._values[0]);
        }

        return (this._length = Math.sqrt(
            this._values.reduce((result, current) => result + current ** 2, 0),
        ));
    }
}
