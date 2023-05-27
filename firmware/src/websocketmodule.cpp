#include <WebsocketModule.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>

WebsocketModule::WebsocketModule(DmxModule* dmxModule)
{
    this->dmxModule = dmxModule;

    websocket = new AsyncWebSocket("/ws");
    websocket->onEvent(std::bind(&WebsocketModule::onWsEvent, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3, std::placeholders::_4, std::placeholders::_5, std::placeholders::_6));
}

void WebsocketModule::handleWsEvent(char *payload, size_t len)
{
    if (debug)
    {
        Serial.println("Incoming WS Event:");
        Serial.println(payload);
    }
    DynamicJsonDocument doc(8192);
    deserializeJson(doc, payload);
    const char *event = doc["event"].as<const char *>();
    if (strcmp(event, "dmx") == 0)
    {
        String arr = doc["data"].as<String>();
        String last = "";
        int channel = 0;
        for (int i = 1; i < arr.length() - 1; i++)
        {
            char c = arr[i];
            if (c != ',')
            {
                last += c;
            }
            else
            {
                if (this->dmxModule->dmxData[channel] != last.toInt() && debug)
                {
                    Serial.print("Write DMX: ");
                    Serial.print(channel);
                    Serial.print(", ");
                    Serial.println(last.toInt());
                    this->dmxModule->setData(channel, last.toInt());
                }
                last = "";
                channel++;
            }
        }
    }
    else if (strcmp(event, "settings") == 0)
    {
        String settings = doc["data"].as<String>();
        bool stateBefore = this->dmxModule->getOutputState();
        this->dmxModule->disableOutput();
        delay(100);
        File file = SPIFFS.open("/settings.json", "w");
        file.print(settings);
        file.close();
        delay(100);
        if (stateBefore)
        {
            this->dmxModule->enableOutput();
        }
        else
        {
            this->dmxModule->disableOutput();
        }
    }
}

void WebsocketModule::handleWsMessage(void *arg, uint8_t *data, size_t len)
{
    AwsFrameInfo *info = (AwsFrameInfo *)arg;

    if (info->index == 0 && info->num == 0)
    {
        // message start
        wsBufferLength = 0;
    }
    memcpy(&wsBuffer[info->index], data, len);
    wsBufferLength += len;
    if (info->final && info->index == 0 && info->len == len)
    {
        // the whole message is in a single frame and we got all of it's data
        if (info->opcode == WS_TEXT)
        {
            char result[wsBufferLength];
            strncpy(result, wsBuffer, wsBufferLength);
            result[wsBufferLength - 1] = '\0';
            wsBufferLength = 0;
            handleWsEvent(result, wsBufferLength);
        }
    }
    else
    {
        // message is comprised of multiple frames or the frame is split into multiple packets
        if ((info->index + len) == info->len)
        {
            // frame end
            if (info->final)
            {
                // message end
                if (info->message_opcode == WS_TEXT)
                {
                    char result[wsBufferLength];
                    strncpy(result, wsBuffer, wsBufferLength);
                    result[wsBufferLength - 1] = '\0';
                    wsBufferLength = 0;
                    handleWsEvent(result, wsBufferLength);
                }
            }
        }
    }
}

void WebsocketModule::onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{
    switch (type)
    {
    case WS_EVT_CONNECT:
        Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
        break;
    case WS_EVT_DISCONNECT:
        Serial.printf("WebSocket client #%u disconnected\n", client->id());
        break;
    case WS_EVT_DATA:
        handleWsMessage(arg, data, len);
        break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
        break;
    }
}

void WebsocketModule::setDebug(bool flag) {
    this->debug = flag;
}