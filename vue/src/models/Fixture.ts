import DMXControllable from "./DMXControllable";
import DMXCommand from "./DMXCommand";
import Scene from "./Scene";
import store from "@/store";

export default class Fixture implements DMXControllable {
  
    constructor(name: string, address: number, numChannels: number, sceneConfig: Map<Scene, DMXCommand[]> = new Map()) {
        this._name = name;
        this._address = address;
        this._numChannels = numChannels;
        this._sceneConfig = sceneConfig;
    }

    private _name : string;
    public get name() : string {
        return this._name;
    }
    public set name(v : string) {
        this._name = v;
    }
    
    private _address : number;
    public get address() : number {
        return this._address;
    }
    public set address(v : number) {
        this._address = v;
    }
  
    
    private _numChannels : number;
    public get numChannels() : number {
        return this._numChannels;
    }
    public set numChannels(v : number) {
        this._numChannels = v;
    }
    

    private _sceneConfig : Map<Scene, DMXCommand[]>;
    public get sceneConfig() : Map<Scene, DMXCommand[]> {
        return this._sceneConfig;
    }
    public set sceneConfig(v : Map<Scene, DMXCommand[]>) {
        this._sceneConfig = v;
    }
    
    setSceneConfig(scene: Scene, commands: DMXCommand[]): void {
        this._sceneConfig.set(scene, commands); 
    }

    activateScene(scene: Scene): boolean {
        const commands = this.sceneConfig.get(scene);
        if (commands === undefined) {
            return false
        }
        commands.forEach((command: DMXCommand) => {
            console.log(`changing scene of Fixture ${this.name} to ${scene.name} => DMX(${this.getAbsoluteChannel(command.channel)}, ${command.value})`);
            store.state.dmxData[this.getAbsoluteChannel(command.channel)] = command.value;
        });
        return true;
    }

    getAbsoluteChannel(channel: number): number {
        return channel + this.address - 1
    }

    sendDMXCommand(channel: number, value: number): void {
        fetch(process.env.VUE_APP_API_URL + '/dmx?' + channel + '=' + value);
    }

}