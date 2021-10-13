import Scene from "./Scene";
import DMXCommand from "./DMXCommand";

export default interface DMXControllable {
    activateScene(scene: Scene): void;
    activateCommands(commands: DMXCommand[]): void;
}