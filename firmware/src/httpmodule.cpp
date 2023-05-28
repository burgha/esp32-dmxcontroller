#include <HttpModule.h>
#include <SPIFFS.h>
#include <map>

HttpModule::HttpModule(WebsocketModule websocketModule, DmxModule* dmxModule)
{
    this->dmxModule = dmxModule;

    server = new AsyncWebServer(80);
    server->addHandler(websocketModule.websocket);

    server->on("/api/settings", HTTP_GET, [&](AsyncWebServerRequest *request) {
        Serial.println("-> Settings");
        File file = SPIFFS.open("/settings.json", "r");
        String data = file.readString();
        file.close();
        if (debug) {
        Serial.println(data);
        }
        request->send(200, "application/json", data);
        delay(100); 
    });

    server->on("/api/settings", HTTP_POST, [&](AsyncWebServerRequest *request) {}, NULL, [&](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        Serial.println("<- Settings");
        if (data[0] != 123) {
        Serial.println("Invalid settings received. ignoring");
        for(size_t i=0; i<len; i++){
            Serial.print(data[i]);
        }
        request->send(400);
        return;
        }

        delay(100);

        File file = SPIFFS.open("/settings.json", "w");
        for(size_t i=0; i<len; i++){
        if (debug) {
            Serial.print(data[i]);
        }
        file.write(data[i]);
        }
        file.close();
        Serial.println();
        request->send(200);
    });

    server->on("/api/enable", HTTP_POST, [&](AsyncWebServerRequest *request) {
        dmxModule->enableOutput();
        request->send(200); 
    });

    server->on("/api/disable", HTTP_POST, [&](AsyncWebServerRequest *request) {
        dmxModule->disableOutput();
        request->send(200); });

    server->on("/api/dmx", HTTP_GET, [&](AsyncWebServerRequest *request) {
        Serial.println("<- DMX");
        if (request->hasParam("channel")) {
        AsyncWebParameter* p = request->getParam("channel");
        int index = p->value().toInt();
        request->send(200, "text/plain", String(this->dmxModule->dmxData[index]));
        } else {
        int size = sizeof(this->dmxModule->dmxData);
        String s = "[";
        for(int i = 0; i < size - 2; i++ )
        {
            s += String(this->dmxModule->dmxData[i]);
            s += ",";
        }
        s += String(this->dmxModule->dmxData[size - 1]);
        s+= "]";
        request->send(200, "application/json", s);
        } 
    });

    server->on("/api/dmx", HTTP_POST, [&](AsyncWebServerRequest *request) {
        Serial.println("-> DMX");
        int params = request->params();
        for(int i=0;i<params;i++){
            AsyncWebParameter* p = request->getParam(i);
            uint16_t channel = p->name().toInt();
            uint8_t value = p->value().toInt();

            if (this->dmxModule->dmxData[channel] != value && debug) {
                Serial.print("Write DMX: ");
                Serial.print(channel);
                Serial.print(", ");
                Serial.println(value);
            }
            this->dmxModule->dmxData[channel] = value;
        }

        request->send(200);
    });

    server->on("/api/clearSettings", HTTP_POST, [&](AsyncWebServerRequest *request) {
        Serial.println("Clearing Settings");
        SPIFFS.remove("/settings.json");
        request->send(200);
    });

    server->on("/api/reboot", HTTP_POST, [&](AsyncWebServerRequest *request) {
        Serial.println("Rebooting");
        request->send(200);
        ESP.restart();
    });

    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");

    server->onNotFound([&](AsyncWebServerRequest *request) {
        if (request->method() == HTTP_OPTIONS) {
            request->send(200);
            return;
        }

        std::map<String, String> mime_types = {
            { ".js", "text/javascript" },
            { ".html", "text/html" },
            { ".css", "text/css" },
            { ".ico", "image/x-ico" },
            { ".png", "image/png" },
            { ".svg", "image/svg" },
            { ".jpg", "image/jpeg" }
        };

        Serial.print("Request: ");
        Serial.println(request->url());
        String url = request->url();
        if (url == "/") {
        File file = SPIFFS.open("/index.html", "r");
        String data = file.readString();
        request->send(200, "text/html", data);
        } else {
        String file_extension = getFileExtension(url);
        String mime_type = mime_types[file_extension];
        request->send(SPIFFS, url, mime_type);
        }
    });
}

void HttpModule::startServer()
{
    server->begin();
}

String HttpModule::getFileExtension(String filename)
{
    int dot = filename.lastIndexOf(".");
    return filename.substring(dot);
}

void HttpModule::setDebug(bool flag) {
    this->debug = flag;
}