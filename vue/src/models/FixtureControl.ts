export default class FixtureControl {
    constructor(name: string, type: FixtureControlType, config: string = '') {
        this._name = name;
        this._type = type;
        this._config = config;
    }

    private _name : string;

    public get name() : string {
        return this._name;
    }

    public set name(v : string) {
        this._name = v;
    }
    
    private _type : FixtureControlType;

    public get type() : FixtureControlType {
        return this._type;
    }

    public set type(v : FixtureControlType) {
        this._type = v;
    }
    
    private _config : string;

    public get config() : string {
        return this._config;
    }

    public set config(v : string) {
        this._config = v;
    }
}

export enum FixtureControlType {
    Slider,
    Colorpicker,
    Switch
}