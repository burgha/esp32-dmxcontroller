export default class WSService {
    private static _instance: WSService;

    private _url : string;
    public get url() : string {
        return this._url;
    }
    
    private _websocket! : WebSocket;
    public get websocket() : WebSocket {
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
    
    private _tries : number = 0;

    constructor(url: string) {
        this._url = url;
        this.connect();
    }

    public send(event: string, data: any): boolean | null {
        if (this._tries > 20) {
            this._tries = 0;
            return false;
        }
        if (this._websocket.readyState === WebSocket.CONNECTING) {
            setTimeout(() => this.send(event, data), 200);
            this._tries++;
            return null;
        }
        if (this.websocket.readyState !== WebSocket.OPEN) {
            this.connect();
            this._tries++;
            setTimeout(() => this.send(event, data), 200);
            return null;
        }
        this._websocket.send(JSON.stringify({event, data}));
        return true;
    }

    private connect(): void {
        this._websocket = new WebSocket(this._url);
        if (this._onOpen !== undefined) {
            this._websocket.onopen = this._onOpen();
        }
        if (this._onMessage !== undefined) {
            this._websocket.onmessage = this._onMessage();
        }
        if (this._onClose !== undefined) {
            this._websocket.onclose = this._onClose();
        }
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