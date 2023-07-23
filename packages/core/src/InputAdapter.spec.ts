import { Input } from "./Input";
import { describe, it, expect } from "vitest";
import { InputAdapter } from "./InputAdapter";
import { InputAxis } from "./InputAxis/InputAxis";
import { InputButton } from "./InputButton/InputButton";

describe("InputAdapter", () => {
    it("should update correctly", () => {
        const eventSource = new ExternalEventSource();
        const input = new Input(
            {
                test: (): TestAdapter => new TestAdapter(eventSource),
            },
            {
                test: {
                    TestButton: TestAdapter.buttonKey,
                },
            },
            {
                test: {
                    TestAxis: TestAdapter.axisKey,
                },
            }
        );

        const steps = [
            (): void => eventSource.dispatch("click"),
            (): void => input.update(),
            (): void => eventSource.dispatch("click"),
            (): void => input.update(),
            (): void => input.update(),
            (): void => eventSource.dispatch("release"),
            (): void => input.update(),
            (): void => eventSource.dispatch("move", [12, 23]),
            (): void => input.update(),
            (): void => eventSource.dispatch("move", [995, 124]),
            (): void => input.update(),
            (): void => eventSource.dispatch("move", [534, 63]),
            (): void => input.update(),
            (): void => input.update(),
        ];

        for (const step of steps) {
            step();

            snapInput();
        }
        input.dispose();

        function snapInput(): void {
            expect(input.getButton("TestButton")).toMatchSnapshot();
            expect(input.getAxis("TestAxis")).toMatchSnapshot();
        }
    });
});

class TestAdapter implements InputAdapter {
    public static readonly buttonKey = "TestAdapter-buttonKey";
    public static readonly axisKey = "TestAdapter-axisKey";

    private readonly _eventSource: ExternalEventSource;

    private _button?: InputButton;
    private _axis?: InputAxis;

    private readonly _clickListener = (): void => {
        this._button?.setDown(true);
    };
    private readonly _releaseListener = (): void => {
        this._button?.setDown(false);
    };

    private readonly _moveListener = (value?: number[] | undefined): void => {
        if (value) {
            this._axis?.setValues(value);
        }
    };

    public constructor(eventSource: ExternalEventSource) {
        this._eventSource = eventSource;

        this._button = new InputButton();
        this._axis = new InputAxis();
        this._eventSource.addListener("click", this._clickListener);
        this._eventSource.addListener("release", this._releaseListener);
        this._eventSource.addListener("move", this._moveListener);
    }

    public getButton(key: "TestAdapter-buttonKey"): Readonly<InputButton> | undefined {
        if (key === TestAdapter.buttonKey) {
            return this._button;
        }
    }

    public getAxis(key: "TestAdapter-axisKey"): Readonly<InputAxis<number[]>> | undefined {
        if (key === TestAdapter.axisKey) {
            return this._axis;
        }
    }

    public update(): void {
        this._button?.update();
        this._axis?.update();
    }

    public dispose(): void {
        this._button = undefined;
        this._axis = undefined;

        this._eventSource.removeListener("click", this._clickListener);
        this._eventSource.removeListener("release", this._releaseListener);
        this._eventSource.removeListener("move", this._moveListener);
    }
}

type EventType = "click" | "release" | "move";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ExternalEventSource<T extends (...args: any[]) => unknown = (...args: any[]) => unknown> {
    private readonly _listeners: {
        [K in EventType]: T[];
    } = {
        click: [],
        release: [],
        move: [],
    };

    public addListener(event: EventType, cb: T): void {
        this._listeners[event].push(cb);
    }

    public removeListener(event: EventType, cb: T): void {
        const index = this._listeners[event].indexOf(cb);

        if (index !== -1) {
            this._listeners[event].splice(index, 1);
        }
    }

    public dispatch<E extends EventType>(
        event: E,
        value?: E extends "move" ? number[] : undefined
    ): void {
        this._listeners[event].forEach((cb) => cb(value));
    }
}
