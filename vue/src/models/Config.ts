import WifiCredentials from "./WifiCredentials";

export default class Config {
  
    private _wifiCredentials : WifiCredentials = new WifiCredentials('', '');
    public get wifiCredentials() : WifiCredentials {
        return this._wifiCredentials;
    }
    public set wifiCredentials(v : WifiCredentials) {
        this._wifiCredentials = v;
    }
    
    private _useWebsockets : boolean = true;
    public get useWebsockets() : boolean {
        return this._useWebsockets;
    }
    public set useWebsockets(v : boolean) {
        this._useWebsockets = v;
    }
    
}