import { KeyboardButton } from "./KeyboardButton";

export type KeyboardAxis<
    T extends KeyboardButton = KeyboardButton,
    U extends KeyboardButton = KeyboardButton,
> = `Axis(${T}, ${U})`;
