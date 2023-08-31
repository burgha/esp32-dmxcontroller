import { WiFiMode } from "./WiFiMode";
import WifiCredentials from "./WifiCredentials";

export default class Config {
    private _wifiMode: WiFiMode = WiFiMode.AccessPoint;
    
    public get wifiMode(): WiFiMode {
        return this._wifiMode;
    }

    public set wifiMode(mode: WiFiMode) {
        this._wifiMode = mode;
    }

    private _apSSID: string = "ESP32-DMX";
    
    public get apSSID(): string {
        return this._apSSID;
    }

    public set apSSID(ssid: string) {
        this._apSSID = ssid;
    }
    
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
    
    private _startupScene : string | null = null;

    public get startupScene() : string | null {
        return this._startupScene;
    }

    public set startupScene(v : string | null) {
        this._startupScene = v;
    }
}