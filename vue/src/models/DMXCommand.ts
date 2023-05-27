export default class DMXCommand {
    constructor(channel: number, value: number) {
        this._channel = channel;
        this._value = value;
    }

    private _channel : number;

    public get channel() : number {
        return this._channel;
    }

    public set channel(v : number) {
        this._channel = v;
    }
    
    private _value : number;

    public get value() : number {
        return this._value;
    }

    public set value(v : number) {
        this._value = v;
    }
}