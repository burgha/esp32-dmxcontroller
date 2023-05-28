#pragma once
#include <ESPAsyncWebServer.h>
#include <websocketmodule.h>
#include <dmxmodule.h>
#include <esp_dmx.h>

class HttpModule {
    public:
        HttpModule(WebsocketModule websocketModule, DmxModule* dmxModule);
        void startServer();
        void setDebug(bool flag);
    private:
        DmxModule* dmxModule;
        AsyncWebServer* server;
        // Variable to store the HTTP request
        String header;
        bool debug;
        String getFileExtension(String filename);
};