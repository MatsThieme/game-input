# game-input

[npm](https://www.npmjs.com/org/game-input)

## packages

### core

```console
npm i @game-input/core
```

### adapters

> Input adapters, like [@game-input/gamepad](https://www.npmjs.com/package/@game-input/gamepad), are listening to input events and tracking state of inputs between frames.

```console
npm i @game-input/adapter-gamepad
```

```console
npm i @game-input/adapter-keyboard
```

```console
npm i @game-input/adapter-mouse
```

```console
npm i @game-input/adapter-touch
```

## usage example

```typescript
import { Gamepad, GamepadAxis, GamepadButton } from "@game-input/adapter-gamepad";
import { Keyboard, KeyboardButton } from "@game-input/adapter-keyboard";
import { Mouse, MouseAxis, MouseButton } from "@game-input/adapter-mouse";
import { Input, InputAxis, InputButton } from "@game-input/core";

const input = new Input(
    {
        mouse: new Mouse(),
        keyboard: new Keyboard(),
        gamepad: new Gamepad(0),
    },
    {
        mouse: {
            Trigger: MouseButton.Left,
        },
        keyboard: {
            Jump: KeyboardButton.Space,
        },
        gamepad: {
            Trigger: GamepadButton.RightTrigger,
        },
    },
    {
        mouse: {
            Cursor: MouseAxis.Position,
        },
        keyboard: {
            MoveHorizontal: `Axis(${KeyboardButton.KeyA}, ${KeyboardButton.KeyD})`,
        },
        gamepad: {
            Move: GamepadAxis.LeftStick,
        },
    }
);

function gameloop() {
    input.update();

    const buttonTrigger: Readonly<InputButton> = input.getButton("Trigger");

    const triggerDown: boolean = buttonTrigger.down;
    const triggerWasDown: boolean = buttonTrigger.wasDown;
    const triggerFirstTimeDown: boolean = buttonTrigger.click;
    const triggerDownAndWasDownLastFrame: boolean = buttonTrigger.clicked;

    const cursorAxis: Readonly<InputAxis> = input.getAxis("Cursor");
    const [cursorX, cursorY]: Readonly<[number, ...number[]]> = cursorAxis.getValues();

    const cursorPositionIsDifferentToLastFrame = cursorAxis.changed;

    const keyboard = input.getAdapter("keyboard");

    input.getButton("Jump") === keyboard.getButton(KeyboardButton.Space); // true
    input.getAxis("MoveHorizontal") === keyboard.getAxis("Axis(KeyA, KeyD)"); // true

    requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);
```

