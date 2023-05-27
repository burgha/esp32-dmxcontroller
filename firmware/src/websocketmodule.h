#pragma once
#include <ESPAsyncWebServer.h>
#include <esp_dmx.h>
#include <dmxmodule.h>

class WebsocketModule {
    public:
        WebsocketModule(DmxModule* dmxModule);
        void handleWsEvent(char* payload, size_t len);
        void handleWsMessage(void *arg, uint8_t *data, size_t len);
        void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len);
        void setDebug(bool flag);
        AsyncWebSocket* websocket;
    private:
        DmxModule* dmxModule;
        bool debug;
        char wsBuffer[8192];
        int wsBufferLength = 0;
};