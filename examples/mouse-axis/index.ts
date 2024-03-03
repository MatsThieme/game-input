import { Input, InputAxis, InputButton } from "@game-input/core";
import { Mouse, MouseAxis, MouseButton } from "@game-input/adapter-mouse";
import { Application, Sprite, Texture } from "pixi.js";

export const input = new Input(
    {
        // declare input devices to use
        mouse: () => new Mouse(),
    },
    {
        mouse: {
            // declare mouse button inputs
            setPlayerPosition: MouseButton.Left,
        },
    },
    {
        mouse: {
            // declare mouse axis inputs
            playerMove: MouseAxis.Movement,
            mousePosition: MouseAxis.Position,
        },
    },
);

// create a pixi app to render a square that is controlled by this input
const pixiApp = new Application({
    width: 1000,
    height: 1000,
});
document.body.appendChild(pixiApp.view as HTMLCanvasElement);

// create a pixi sprite and wrap it in a object used to track the players state
const player1State = createPlayerState("#f66");

// add the sprite to pixis scene to show it on screen
pixiApp.stage.addChild(player1State.sprite);

// initialize an update loop using requestAnimationFrame
let lastUpdate: number = 0;
function update(time: number): void {
    if (lastUpdate !== 0) {
        // update the input instance every frame
        input.update();

        // update the player state with the previously configured inputs
        updatePlayer(
            input.getAxis("playerMove"),
            input.getAxis("mousePosition"),
            input.getButton("setPlayerPosition"),
            player1State,
        );
    }

    lastUpdate = time;

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function updatePlayer(
    moveAxis: Readonly<InputAxis> | undefined,
    positionAxis: Readonly<InputAxis> | undefined,
    setPlayerPositionButton: Readonly<InputButton> | undefined,
    playerState: typeof player1State,
): void {
    if (moveAxis) {
        const [x, y] = moveAxis.getValues();

        // add the mouse movement since the last frame to the player position
        playerState.x += x;
        playerState.y += y;
    }

    // set the sprite position
    if (setPlayerPositionButton?.down && positionAxis) {
        // if the left mouse button is down, the sprite position is set to the mouse position
        const [x, y] = positionAxis.getValues();
        playerState.sprite.position.x = x;
        playerState.sprite.position.y = y;
    } else {
        // else the position from the tracked mouse movements is used
        playerState.sprite.position.x = playerState.x;
        playerState.sprite.position.y = playerState.y;
    }
}

function createPlayerState(color: string) {
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

    player.x = pixiApp.renderer.width / 2;
    player.y = pixiApp.renderer.height / 2;

    player.anchor.x = 0.5;
    player.anchor.y = 0.5;

    return {
        sprite: player,
        x: player.x,
        y: player.y,
    };
}
