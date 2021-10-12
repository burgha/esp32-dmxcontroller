import WifiCredentials from "./WifiCredentials";

export default class Config {
  
    private _wifiCredentials : WifiCredentials = new WifiCredentials('', '');
    public get wifiCredentials() : WifiCredentials {
        return this._wifiCredentials;
    }
    public set wifiCredentials(v : WifiCredentials) {
        this._wifiCredentials = v;
    }
    
}