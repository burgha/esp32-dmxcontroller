export default class WSService {
    private static _instance: WSService;

    private _url : string;
    public get url() : string {
        return this._url;
    }
    
    private _websocket : any;
    public get websocket() : any {
        return this._websocket;
    }
    
    private _onOpen : any;
    public get onOpen() : any {
        return this._onOpen;
    }
    public set onOpen(fn : any) {
        this._onOpen = fn;
        this._websocket.onopen = this._onOpen();
    }
    
    private _onMessage : any;
    public get onMessage() : any {
        return this._onMessage;
    }
    public set onMessage(fn : any) {
        this._onMessage = fn;
        this._websocket.onmessage = this._onOpen();
    }
    
    private _onClose : any;
    public get onClose() : any {
        return this._onClose;
    }
    public set onClose(fn : any) {
        this._onClose = fn;
        this._websocket.onclose = this._onOpen();
    }

    constructor(url: string) {
        this._url = url;
        this._websocket = new WebSocket(url);
        WSService._instance = this;
    }

    public send(event: string, data: any) {
        if (this._websocket.readyState === 0) {
            setTimeout(() => this.send(event, data), 2000);
            return;
        }
        this._websocket.send(JSON.stringify({event, data}));
    }

    static createInstance(url: string): void {
        WSService._instance = new WSService(url);
    }

    static getInstance(): WSService {
        if (WSService._instance instanceof WSService) {
            return WSService._instance;
        } else {
            throw new Error('WSService not initialized. use WSService::createInstance()');
        }
    }
}