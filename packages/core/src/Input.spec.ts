import { Input } from "./Input";
import { describe, it, expect, vi } from "vitest";
import { InputAdapter } from "./InputAdapter";

describe("Input", () => {
    it("should return the correct adapter", () => {
        const adapter = {} as never;

        const input = new Input({ test: adapter }, {}, {});

        expect(input.getAdapter("test")).toBe(adapter);
    });

    it("should initialize adapters", () => {
        const adapterInitializeFn = vi.fn();

        const adapter = {
            initialize: adapterInitializeFn,
        } satisfies Pick<InputAdapter, "initialize"> as never;

        const input = new Input({ test: adapter }, {}, {});

        expect(adapterInitializeFn).toBeCalledTimes(0);

        input.initialize();

        expect(adapterInitializeFn).toBeCalledTimes(1);
    });

    it("should update and initializeadapters", () => {
        const adapterUpdateFn = vi.fn();

        const adapter = {
            initialize: (): void => undefined,
            update: adapterUpdateFn,
        } satisfies Pick<InputAdapter, "initialize" | "update"> as never;

        const input = new Input({ test: adapter }, {}, {});

        expect(adapterUpdateFn).toBeCalledTimes(0);

        input.initialize();

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

        const input = new Input({ test: adapter }, {}, {});

        expect(adapterDisposeFn).toBeCalledTimes(0);

        input.dispose();

        expect(adapterDisposeFn).toBeCalledTimes(1);
    });

    it("should return an adapters input button", () => {
        const adapterGetButtonFn = vi.fn();

        const adapter = {
            initialize: (): void => undefined,
            update: (): void => undefined,
            dispose: (): void => undefined,
            getButton: adapterGetButtonFn,
        } satisfies Pick<InputAdapter, "initialize" | "update" | "dispose" | "getButton"> as never;

        const input = new Input({ test: adapter }, { test: { test: "test" } }, {});

        expect(adapterGetButtonFn).toBeCalledTimes(0);

        input.initialize();

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
            initialize: (): void => undefined,
            update: (): void => undefined,
            dispose: (): void => undefined,
            getAxis: adapterGetAxisFn,
        } satisfies Pick<InputAdapter, "initialize" | "update" | "dispose" | "getAxis"> as never;

        const input = new Input({ test: adapter }, {}, { test: { test: "test" } });

        expect(adapterGetAxisFn).toBeCalledTimes(0);

        input.initialize();

        expect(adapterGetAxisFn).toBeCalledTimes(0);

        input.getAxis("test");

        expect(adapterGetAxisFn).toBeCalledTimes(1);

        input.update();

        expect(adapterGetAxisFn).toBeCalledTimes(1);

        input.dispose();

        expect(adapterGetAxisFn).toBeCalledTimes(1);
    });
});
