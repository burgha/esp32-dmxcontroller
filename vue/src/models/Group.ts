import DMXCommand from "./DMXCommand";
import DMXControllable from "./DMXControllable";
import Fixture from "./Fixture";
import Scene from "./Scene";

export default class Group implements DMXControllable {
  
    constructor(name: string, members: Fixture[] = []) {
        this._name = name;
        this._members = members;
    }
  
    private _name : string;
    public get name() : string {
        return this._name;
    }
    public set name(v : string) {
        this._name = v;
    }
    
    private _members : Fixture[];
    public get members() : Fixture[] {
        return this._members;
    }
    public set members(v : Fixture[]) {
        this._members = v;
    }
    
    public activateScene(scene: Scene): void {
        this._members.forEach((fixture: Fixture) => {
            fixture.activateScene(scene);
        });
    }

    public activateCommands(commands: DMXCommand[]): void {
        this._members.forEach((fixture: Fixture) => {
            commands.forEach((command: DMXCommand) => {
                fixture.applyDMXCommand(command);
            });
        });
    }
}