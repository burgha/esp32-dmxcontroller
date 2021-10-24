#include <Arduino.h>

#include <SPIFFS.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <esp_dmx.h>
#include <ArduinoJson.h>
#include <map>

bool DEBUG = true;

int transmitPin = 23;
int receivePin = 22;
int enablePin = 21;

dmx_port_t dmxPort = DMX_NUM_1;
byte dmxData[DMX_MAX_PACKET_SIZE];
bool dmxAutoLock = false;
bool dmxManualLock = true;

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Variable to store the HTTP request
String header;

// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

char wsBuffer[8192];
int wsBufferLength = 0;

DynamicJsonDocument settings(8192);

void loadSettings() {
  if (SPIFFS.exists("/settings.json")) {
    File file = SPIFFS.open("/settings.json", "r");
    String json = file.readString();
    file.close();

    deserializeJson(settings, json);

    if (DEBUG) {
      Serial.println(settings.as<String>());
    }
  }
}

void createWifi() {
  Serial.println("\nCreating WiFi Network");
  WiFi.softAP("ESP32-DMX");
}

void connectWifi(String ssid, String password) {
  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid.c_str(), password.c_str());
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    if (tries == 50) {
      WiFi.disconnect();
      createWifi();
      return;
    }
    delay(500);
    Serial.print(".");
    tries++;
  }
   
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void initWifi() {
  if (!SPIFFS.exists("/settings.json")) {
    createWifi();
    return;
  }
  // *w = _wifiCredentials, *ss = _ssid, *p = _password
  String ssid = settings["config"]["*w"]["*ss"].as<String>();
  String password = settings["config"]["*w"]["*p"].as<String>();

  Serial.println(ssid);

  if (ssid != "" && password != "") {
    connectWifi(ssid, password);
    return;
  } else {
    createWifi();
  }
}

void handleWsEvent(char* payload, size_t len) {
  if (DEBUG) {
    Serial.println("Incoming WS Event:");
    Serial.println(payload);
  }
  DynamicJsonDocument doc(8192);
  deserializeJson(doc, payload);
  const char* event = doc["event"].as<const char*>();
  if (strcmp(event, "dmx") == 0) {
    String arr = doc["data"].as<String>();
    String last = "";
    int channel = 0;
    for(int i = 1; i < arr.length() - 1; i++) {
      char c = arr[i];
      if (c != ',') {
        last += c;
      } else {
        if (dmxData[channel] != last.toInt() && DEBUG) {
          Serial.print("Write DMX: ");
          Serial.print(channel);
          Serial.print(", ");
          Serial.println(last.toInt());
          dmxData[channel] = last.toInt();
        }
        last = "";
        channel++;
      }
    }
  } else if (strcmp(event, "settings") == 0) {
    String settings = doc["data"].as<String>();
    bool lockBefore = dmxManualLock;
    dmxManualLock = true;
    delay(100);
    File file = SPIFFS.open("/settings.json", "w");
    file.print(settings);
    file.close();
    delay(100);
    dmxManualLock = lockBefore;
  }
}

void handleWsMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;

  if(info->index == 0 && info->num == 0) {
    // message start
    wsBufferLength = 0;
  }
  memcpy(&wsBuffer[info->index], data, len);
  wsBufferLength += len;
  if(info->final && info->index == 0 && info->len == len){
    //the whole message is in a single frame and we got all of it's data
    if(info->opcode == WS_TEXT){
        char result[wsBufferLength];
        strncpy(result, wsBuffer, wsBufferLength);
        result[wsBufferLength-1] = '\0';
        wsBufferLength = 0;
        handleWsEvent(result, wsBufferLength);
    }
  } else {
    //message is comprised of multiple frames or the frame is split into multiple packets
    if((info->index + len) == info->len){
      // frame end
      if(info->final){
        // message end
        if(info->message_opcode == WS_TEXT) {
          char result[wsBufferLength];
          strncpy(result, wsBuffer, wsBufferLength);
          result[wsBufferLength-1] = '\0';
          wsBufferLength = 0;
          handleWsEvent(result, wsBufferLength);
        }
      }
    }
  }
}

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
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

void initWsClient() {
  ws.onEvent(onWsEvent);
}

String getFileExtension(String filename) {
  int dot = filename.lastIndexOf(".");
  return filename.substring(dot);
}

void setup() {
  Serial.begin(115200);

  //Initialize SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  loadSettings();

  // Init DMX
  const dmx_config_t config = DMX_DEFAULT_CONFIG;
  dmx_param_config(dmxPort, &config);
  dmx_set_pin(dmxPort, transmitPin, receivePin, enablePin);
  QueueHandle_t dmx_queue;
  dmx_driver_install(dmxPort, DMX_MAX_PACKET_SIZE, 10, &dmx_queue, ESP_INTR_FLAG_IRAM);
  dmx_set_mode(dmxPort, DMX_MODE_TX);

  initWifi();
  initWsClient();

  server.on("/api/settings", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("-> Settings");
    bool lockBefore = dmxManualLock;
    dmxManualLock = true;
    delay(100);
    File file = SPIFFS.open("/settings.json", "r");
    String data = file.readString();
    file.close();
    delay(100);
    dmxManualLock = lockBefore;
    if (DEBUG) {
      Serial.println(data);
    }
    request->send(200, "application/json", data);
    delay(100);
  });

  server.on("/api/settings", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
    Serial.println("<- Settings");
    if (data[0] != 123) {
      Serial.println("Invalid settings received. ignoring");
      for(size_t i=0; i<len; i++){
        Serial.print(data[i]);
      }
      request->send(400);
      return;
    }

    bool lockBefore = dmxManualLock;
    dmxManualLock = true;
    delay(100);

    File file = SPIFFS.open("/settings.json", "w");
    for(size_t i=0; i<len; i++){
      if (DEBUG) {
        Serial.print(data[i]);
      }
      file.write(data[i]);
    }
    file.close();
    Serial.println();
    request->send(200);
    delay(100);
    dmxManualLock = lockBefore;
  });

  server.on("/api/enable", HTTP_POST, [](AsyncWebServerRequest *request){
    Serial.println("Enabling DMX");
    dmxManualLock = false;
    request->send(200);
  });

  server.on("/api/disable", HTTP_POST, [](AsyncWebServerRequest *request){
    Serial.println("Disabling DMX");
    dmxManualLock = true;
    request->send(200);
  });

  server.on("/api/dmx", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("channel")) {
      AsyncWebParameter* p = request->getParam("channel");
      int index = p->value().toInt();
      request->send(200, "text/plain", String(dmxData[index]));
    } else {
      int size = sizeof(dmxData);
      String s = "[";
      for(int i = 0; i < size - 2; i++ )
      {
        s += String(dmxData[i]);
        s += ",";
      }
      s += String(dmxData[size - 1]);
      s+= "]";
      request->send(200, "application/json", s);
    }
  });

  server.on("/api/dmx", HTTP_POST, [](AsyncWebServerRequest *request){
    int params = request->params();
    for(int i=0;i<params;i++){
      AsyncWebParameter* p = request->getParam(i);
      uint16_t channel = p->name().toInt();
      uint8_t value = p->value().toInt();

      if (dmxData[channel] != value && DEBUG) {
        Serial.print("Write DMX: ");
        Serial.print(channel);
        Serial.print(", ");
        Serial.println(value);
      }
      dmxData[channel] = value;
    }

    request->send(200);
  });

  server.on("/api/clearSettings", HTTP_POST, [](AsyncWebServerRequest *request){
    Serial.println("Clearing Settings");
    dmxAutoLock = true;
    SPIFFS.remove("/settings.json");
    request->send(200);
  });

  server.on("/api/reboot", HTTP_POST, [](AsyncWebServerRequest *request){
    Serial.println("Rebooting");
    request->send(200);
    ESP.restart();
  });

  server.addHandler(&ws);

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");

  server.onNotFound([](AsyncWebServerRequest *request) {
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
    dmxAutoLock = true;
    if (url == "/") {
      File file = SPIFFS.open("/index.html", "r");
      String data = file.readString();
      request->send(200, "text/html", data);
    } else {
      String file_extension = getFileExtension(url);
      String mime_type = mime_types[file_extension];
      request->send(SPIFFS, url, "text/javascript");
    }
  });

  Serial.println("Init done");
  server.begin();
}

void loop(){
  if (dmxManualLock) {
    return;
  }
  if (dmxAutoLock) {
    delay(2500);
    dmxAutoLock = false;
  }
  dmx_write_packet(dmxPort, dmxData, DMX_MAX_PACKET_SIZE);
  dmx_tx_packet(dmxPort);
  dmx_wait_tx_done(dmxPort, DMX_TX_PACKET_TOUT_TICK);
  if (DEBUG) {
    //Serial.println("DMX Tick");
  }
  delay(25);
}