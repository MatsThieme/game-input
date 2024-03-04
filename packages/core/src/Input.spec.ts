import { Input } from "./Input";
import { describe, it, expect, vi } from "vitest";
import { InputAdapter } from "./InputAdapter";
import { InputAxis } from "./InputAxis/InputAxis";
import { InputButton } from "./InputButton/InputButton";

describe("Input", () => {
    it("should update and initializeadapters", () => {
        const adapterUpdateFn = vi.fn();

        const adapter = {
            update: adapterUpdateFn,
        } satisfies Pick<InputAdapter, "update"> as never;

        const input = new Input({ test: (): InputAdapter => adapter }, {}, {});

        expect(adapterUpdateFn).toBeCalledTimes(0);

        input.update();

        expect(adapterUpdateFn).toBeCalledTimes(1);

        input.update();

        expect(adapterUpdateFn).toBeCalledTimes(2);
    });

    it("should dispose adapters", () => {
        const adapterDisposeFn = vi.fn();

        const adapter = {
            dispose: adapterDisposeFn,
        } satisfies Pick<InputAdapter, "dispose"> as never;

        const input = new Input({ test: (): InputAdapter => adapter }, {}, {});

        expect(adapterDisposeFn).toBeCalledTimes(0);

        input.dispose();

        expect(adapterDisposeFn).toBeCalledTimes(1);
    });

    it("should return an adapters input button", () => {
        const adapterGetButtonFn = vi.fn();

        const adapter = {
            update: (): void => undefined,
            dispose: (): void => undefined,
            getButton: adapterGetButtonFn,
        } satisfies Pick<InputAdapter, "update" | "dispose" | "getButton"> as never;

        const input = new Input(
            { test: (): InputAdapter => adapter },
            { test: { test: "test" } },
            {},
        );

        expect(adapterGetButtonFn).toBeCalledTimes(0);

        input.getButton("test");

        expect(adapterGetButtonFn).toBeCalledTimes(1);

        input.update();

        expect(adapterGetButtonFn).toBeCalledTimes(1);

        input.dispose();

        expect(adapterGetButtonFn).toBeCalledTimes(1);
    });

    it("should return an adapters input axis", () => {
        const adapterGetAxisFn = vi.fn();

        const adapter = {
            update: (): void => undefined,
            dispose: (): void => undefined,
            getAxis: adapterGetAxisFn,
        } satisfies Pick<InputAdapter, "update" | "dispose" | "getAxis"> as never;

        const input = new Input(
            { test: (): InputAdapter => adapter },
            {},
            { test: { test: "test" } },
        );

        expect(adapterGetAxisFn).toBeCalledTimes(0);

        input.getAxis("test");

        expect(adapterGetAxisFn).toBeCalledTimes(1);

        input.update();

        expect(adapterGetAxisFn).toBeCalledTimes(1);

        input.dispose();

        expect(adapterGetAxisFn).toBeCalledTimes(1);
    });

    it("should get buttons and axes using getAdapterButton and getAdapterAxis without an input mapping", () => {
        class TestInputAdapter
            implements InputAdapter<"testButton1" | "testButton2", "testAxis1" | "testAxis2">
        {
            private _testButton1?: InputButton;
            private _testButton2?: InputButton;
            private _testAxis1?: InputAxis;
            private _testAxis2?: InputAxis;

            public constructor() {
                this._testButton1 = new InputButton();
                this._testButton2 = new InputButton();
                this._testAxis1 = new InputAxis();
                this._testAxis2 = new InputAxis();
            }

            public getButton(
                key: "testButton1" | "testButton2",
            ): Readonly<InputButton> | undefined {
                return this[`_${key}`];
            }
            public getAxis(
                key: "testAxis1" | "testAxis2",
            ): Readonly<InputAxis<number[]>> | undefined {
                return this[`_${key}`];
            }
            public update(): void {
                throw new Error("Method not implemented.");
            }
            public dispose(): void {
                throw new Error("Method not implemented.");
            }
        }

        const input = new Input(
            { test: (): TestInputAdapter => new TestInputAdapter() },
            { test: { btn1: "testButton1", btn2: "testButton2" } },
            { test: { axis1: "testAxis1", axis2: "testAxis2" } },
        );

        expect(input.getAdapterButton("test", "testButton1")).toBe(input.getButton("btn1"));
        expect(input.getAdapterButton("test", "testButton1")).not.toBe(input.getButton("btn2"));
        expect(input.getAdapterButton("test", "testButton2")).toBe(input.getButton("btn2"));
        expect(input.getAdapterButton("test", "testButton2")).not.toBe(input.getButton("btn1"));

        expect(input.getAdapterAxis("test", "testAxis1")).toBe(input.getAxis("axis1"));
        expect(input.getAdapterAxis("test", "testAxis1")).not.toBe(input.getAxis("axis2"));
        expect(input.getAdapterAxis("test", "testAxis2")).toBe(input.getAxis("axis2"));
        expect(input.getAdapterAxis("test", "testAxis2")).not.toBe(input.getAxis("axis1"));
    });

    it("should work with empty string and zero as input key", () => {
        type ButtonAndActionKeys = "" | "test" | 0 | 123;

        class TestInputAdapter implements InputAdapter<ButtonAndActionKeys, ButtonAndActionKeys> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            public getButton(_key: ButtonAndActionKeys): Readonly<InputButton> | undefined {
                return new InputButton();
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            public getAxis(_key: ButtonAndActionKeys): Readonly<InputAxis<number[]>> | undefined {
                return new InputAxis();
            }
            public update(): void {
                throw new Error("Method not implemented.");
            }
            public dispose(): void {
                throw new Error("Method not implemented.");
            }
        }

        const input = new Input(
            { test: () => new TestInputAdapter() },
            { test: { emptyString: "", notEmptyString: "test", zero: 0, notZero: 123 } },
            { test: { emptyString: "", notEmptyString: "test", zero: 0, notZero: 123 } },
        );

        expect(input.getButton("emptyString")).toBeDefined();
        expect(input.getButton("notEmptyString")).toBeDefined();
        expect(input.getButton("zero")).toBeDefined();
        expect(input.getButton("notZero")).toBeDefined();

        expect(input.getAxis("emptyString")).toBeDefined();
        expect(input.getAxis("notEmptyString")).toBeDefined();
        expect(input.getAxis("zero")).toBeDefined();
        expect(input.getAxis("notZero")).toBeDefined();
    });
});
