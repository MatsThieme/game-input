import { InputAxis } from "./InputAxis";

describe("InputAxis", () => {
    it.each([
        [new InputAxis(), 0],
        [new InputAxis(0), 0],
        [new InputAxis([0]), 0],
        [new InputAxis([0, 0]), 0],
        [new InputAxis(1), 1],
        [new InputAxis([1]), 1],
        [new InputAxis([1, 0]), 1],
        [new InputAxis([0, 1]), 1],
        [new InputAxis([0.7, 0.7]), Math.sqrt(0.7 ** 2 * 2)],
        [new InputAxis([0.7, 0.7, 1, 1, 1, 1]), Math.sqrt(0.7 ** 2 * 2 + 4)],
    ])("should calculate the length of its values", (axis: InputAxis, length: number) => {
        expect(axis.getLength()).toBeCloseTo(length, 10);
    });

    it("should update correctly", () => {
        const axis = new InputAxis();

        expect(axis.changed).toBeFalsy();

        axis.setValues([1, 2, 3]);

        expect(axis.changed).toBeFalsy();

        axis.update();

        expect(axis.changed).toBeTruthy();

        axis.update();

        expect(axis.changed).toBeFalsy();
    });
});
