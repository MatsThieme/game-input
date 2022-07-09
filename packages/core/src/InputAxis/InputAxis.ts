type NumberTupleMinLength = [number, ...number[]];

export class InputAxis {
    private _values: NumberTupleMinLength;
    private _length?: number;
    private _changed: number;

    public constructor(values?: number | NumberTupleMinLength) {
        if (values === undefined) this._values = [0];
        else if (typeof values === "number") this._values = [values];
        else this._values = values.slice() as NumberTupleMinLength;

        this._changed = 0;
    }

    /**
     * Returns whether values changed in the last frame.
     */
    public get changed(): boolean {
        return this._changed === 1;
    }

    public getValues(): Readonly<NumberTupleMinLength> {
        return this._values;
    }

    /**
     * @internal
     */
    public setValues(values: Readonly<NumberTupleMinLength>): void {
        if (
            this._values.length !== values.length ||
            this._values.some((value, index) => value !== values[index])
        ) {
            this._values = values.slice() as NumberTupleMinLength;

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
            this._values.reduce((result, current) => result + current ** 2, 0)
        ));
    }
}
