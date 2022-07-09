import { InputButton } from "./InputButton";

describe("InputButton", () => {
    it("should update correctly", () => {
        const button = new InputButton();

        expect(button.down).toEqual(false);
        expect(button.wasDown).toEqual(false);
        expect(button.click).toEqual(false);
        expect(button.clicked).toEqual(false);

        button.update();

        expect(button.down).toEqual(false);
        expect(button.wasDown).toEqual(false);
        expect(button.click).toEqual(false);
        expect(button.clicked).toEqual(false);

        button.setDown(true);

        button.update();

        expect(button.down).toEqual(true);
        expect(button.wasDown).toEqual(false);
        expect(button.click).toEqual(true);
        expect(button.clicked).toEqual(false);

        button.update();

        expect(button.down).toEqual(true);
        expect(button.wasDown).toEqual(true);
        expect(button.click).toEqual(false);
        expect(button.clicked).toEqual(true);

        button.setDown(false);

        button.update();

        expect(button.down).toEqual(false);
        expect(button.wasDown).toEqual(true);
        expect(button.click).toEqual(false);
        expect(button.clicked).toEqual(false);

        button.update();

        expect(button.down).toEqual(false);
        expect(button.wasDown).toEqual(false);
        expect(button.click).toEqual(false);
        expect(button.clicked).toEqual(false);
    });
});
