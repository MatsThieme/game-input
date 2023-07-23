import { Input, InputAxis, InputButton } from "@game-input/core";
import { Keyboard, KeyboardButton } from "@game-input/adapter-keyboard";
import { Mouse, MouseAxis } from "@game-input/adapter-mouse";
import { Application, Sprite, Texture } from "pixi.js";

const input = new Input(
    {
        keyboardPlayer0: () => new Keyboard(),
        keyboardPlayer1: () => new Keyboard(),
        mousePlayer0: () => new Mouse(),
        mousePlayer1: () => new Mouse(),
    },
    {
        keyboardPlayer0: { player1DoStuff: KeyboardButton.Space },
        keyboardPlayer1: { player2DoStuff: KeyboardButton.Numpad0 },
        mousePlayer0: {},
        mousePlayer1: {},
    },
    {
        keyboardPlayer0: {},
        keyboardPlayer1: {},
        mousePlayer0: { player1Move: MouseAxis.Movement },
        // TODO: use different inputs
        mousePlayer1: { player2Move: MouseAxis.Movement },
    }
);

const pixiApp = new Application({
    width: 1000,
    height: 1000,
});
document.body.appendChild(pixiApp.view as HTMLCanvasElement);

let lastUpdate: number = performance.now();

const player1State = {
    isUp: false,
    sprite: createPlayerPixiSprite("#f00", -1),
};
const player2State = {
    isUp: false,
    sprite: createPlayerPixiSprite("#00f", 1),
};
pixiApp.stage.addChild(player1State.sprite);
pixiApp.stage.addChild(player2State.sprite);

function update(time: number): void {
    input.update();

    const delta = time - lastUpdate;
    lastUpdate = time;

    updatePlayer(
        delta,
        input.getAxis("player1Move"),
        input.getButton("player1DoStuff"),
        player1State
    );
    updatePlayer(
        delta,
        input.getAxis("player2Move"),
        input.getButton("player2DoStuff"),
        player2State
    );

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function updatePlayer(
    delta: number,
    moveAxis: Readonly<InputAxis> | undefined,
    button: Readonly<InputButton> | undefined,
    playerState: { isUp: boolean; sprite: Sprite }
): void {
    if (moveAxis) {
        const [x, y] = moveAxis.getValues();

        playerState.sprite.position.x += (x * delta) / 5;
        playerState.sprite.position.y += (y * delta) / 5;
    }

    if (button && button.click) {
        playerState.isUp = !playerState.isUp;
        playerState.sprite.position.y += -(+playerState.isUp - 0.5) * 200;
    }
}

function createPlayerPixiSprite(color: string, offsetX: number): Sprite {
    const canvasSize = 100;
    const playerCanvas = document.createElement("canvas");
    playerCanvas.width = canvasSize;
    playerCanvas.height = canvasSize;
    const playerCanvasCtx = playerCanvas.getContext("2d");

    if (!playerCanvasCtx) {
        throw new Error("failed to get 2d context");
    }

    playerCanvasCtx.fillStyle = color;
    playerCanvasCtx.fillRect(0, 0, canvasSize, canvasSize);

    const player = Sprite.from(Texture.from(playerCanvas));

    player.x = pixiApp.renderer.width / 2 + canvasSize * offsetX;
    player.y = pixiApp.renderer.height / 2;

    player.anchor.x = 0.5;
    player.anchor.y = 0.5;

    return player;
}
