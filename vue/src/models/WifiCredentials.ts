export default class WifiCredentials {
    
    constructor(ssid: string, password: string) {
        this._ssid = ssid;
        this._password = password;
    }

    private _ssid : string;
    public get ssid() : string {
        return this._ssid;
    }
    public set ssid(v : string) {
        this._ssid = v;
    }
    
    private _password : string;
    public get password() : string {
        return this._password;
    }
    public set password(v : string) {
        this._password = v;
    }
    
}