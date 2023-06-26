import { InputAxis } from "./InputAxis";
import { describe, it, expect } from "vitest";

describe("InputAxis", () => {
    it.each([
        [new InputAxis()],
        [new InputAxis(0)],
        [new InputAxis([0])],
        [new InputAxis([0, 0])],
        [new InputAxis(1)],
        [new InputAxis([1])],
        [new InputAxis([1, 0])],
        [new InputAxis([0, 1])],
        [new InputAxis([0.7, 0.7])],
        [new InputAxis([0.7, 0.7, 1, 1, 1, 1])],
    ])("should calculate the length of its values", (axis: InputAxis) => {
        snapAxis(axis);
    });

    it("should update correctly", () => {
        const axis = new InputAxis();

        snapAxis(axis);

        axis.setValues([1, 2, 3]);

        snapAxis(axis);

        axis.update();

        snapAxis(axis);

        axis.update();

        snapAxis(axis);
    });
});

function snapAxis(axis: InputAxis): void {
    expect({
        changed: axis.changed,
        length: axis.getLength(),
        values: axis.getValues(),
    }).toMatchSnapshot();
}
