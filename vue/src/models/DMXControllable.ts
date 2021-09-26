import Scene from "./Scene";

export default interface DMXControllable {
    activateScene(scene: Scene): void;
}