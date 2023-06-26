import { InputButton } from "./InputButton";
import { describe, it, expect } from "vitest";

describe("InputButton", () => {
    it("should update correctly", () => {
        const button = new InputButton();

        snapBtn(button);

        button.update();

        expect(snapBtn(button)).toMatchSnapshot();

        button.setDown(true);

        button.update();

        expect(snapBtn(button)).toMatchSnapshot();

        button.update();

        expect(snapBtn(button)).toMatchSnapshot();

        button.setDown(false);

        button.update();

        expect(snapBtn(button)).toMatchSnapshot();

        button.update();

        expect(snapBtn(button)).toMatchSnapshot();
    });
});

function snapBtn(button: InputButton): void {
    expect({
        down: button.down,
        wasDown: button.wasDown,
        click: button.click,
        clicked: button.clicked,
    }).toMatchSnapshot();
}
