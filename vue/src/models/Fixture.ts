import type DMXControllable from "./DMXControllable";
import DMXCommand from "./DMXCommand";
import Scene from "./Scene";
import FixtureControl from "./FixtureControl";
import { useDmxStore } from "@/stores/dmx";

export default class Fixture implements DMXControllable {
    constructor(name: string, address: number, numChannels: number, sceneConfig: Map<Scene, DMXCommand[]> = new Map(), controls: FixtureControl[] = []) {
        this._name = name;
        this._address = address;
        this._numChannels = numChannels;
        this._sceneConfig = sceneConfig;
        this._controls = controls;
    }

    private _name: string;

    public get name(): string {
        return this._name;
    }

    public set name(v: string) {
        this._name = v;
    }

    private _address: number;

    public get address(): number {
        return this._address;
    }

    public set address(v: number) {
        this._address = v;
    }

    private _numChannels: number;

    public get numChannels(): number {
        return this._numChannels;
    }

    public set numChannels(v: number) {
        this._numChannels = v;
    }

    private _sceneConfig: Map<Scene, DMXCommand[]>;
    
    public get sceneConfig(): Map<Scene, DMXCommand[]> {
        return this._sceneConfig;
    }

    public set sceneConfig(v: Map<Scene, DMXCommand[]>) {
        this._sceneConfig = v;
    }

    private _controls: FixtureControl[];

    public get controls(): FixtureControl[] {
        return this._controls;
    }

    public set controls(v: FixtureControl[]) {
        this._controls = v;
    }

    public setSceneConfig(scene: Scene, commands: DMXCommand[]): void {
        this._sceneConfig.set(scene, commands);
    }

    public activateScene(scene: Scene): boolean {
        const commands = this.sceneConfig.get(scene);
        if (commands === undefined) {
            return false
        }
        commands.forEach((command: DMXCommand) => {
            console.log(`changing scene of Fixture ${this.name} to ${scene.name} => DMX(${this.getAbsoluteChannel(command.channel)}, ${command.value})`);
            this.applyDMXCommand(command);
        });
        return true;
    }

    public applyCommands(commands: DMXCommand[]): void {
        commands.forEach((command: DMXCommand) => {
            this.applyDMXCommand(command);
        });
    }

    public getAbsoluteChannel(channel: number): number {
        return Number(channel) + Number(this.address) - 1
    }

    public applyDMXCommand(command: DMXCommand) {
        const store = useDmxStore();
        store.dmxData[this.getAbsoluteChannel(command.channel)] = command.value;
    }

    public getDMXData(channel: number) {
        const store = useDmxStore();
        return store.dmxData[this.getAbsoluteChannel(channel)];
    }
}