import DMXControllable from "./DMXControllable";
import DMXCommand from "./DMXCommand";
import Scene from "./Scene";

export default class Fixture implements DMXControllable {
  
    constructor(name: string, address: number, sceneConfig: Map<Scene, DMXCommand[]> = new Map()) {
        this._name = name;
        this._address = address;
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
            const channel = command.channel + this.address - 1;
            console.log(`changing scene of Fixture ${this.name} to ${scene.name} => DMX(${channel}, ${command.value})`);
            //fetch(process.env.VUE_APP_API_URL + '/dmx?channel=' + (channel + this._address) + '&value=' + command.value); 
        });
        return true;
    }

}