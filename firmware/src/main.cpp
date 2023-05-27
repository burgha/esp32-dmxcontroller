#include <Arduino.h>

#include <SPIFFS.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <map>

#include <DmxModule.h>
#include <WebsocketModule.h>
#include <HttpModule.h>

bool DEBUG = true;

DmxModule dmxModule = DmxModule();
DmxModule* dmxPointer = &dmxModule;
WebsocketModule websocketModule = WebsocketModule(dmxPointer);
HttpModule httpModule = HttpModule(websocketModule, dmxPointer);

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

void setStartupScene() {
  String startupScene = settings["config"]["*sSc"].as<String>();
  JsonArray fixtures = settings["*fs"].as<JsonArray>();
  for(JsonVariant f : fixtures) {
    JsonArray sceneConfig = f["*sC"].as<JsonArray>();
    for(JsonVariant sc : sceneConfig) {
      if (sc["*s"].as<String>() == startupScene) {
        JsonArray cmds = sc["*cs"].as<JsonArray>();
        for(JsonVariant cmd : cmds) {
          int channel = cmd["*c"].as<int>();
          int value = cmd["*v"].as<int>();
          dmxModule.dmxData[channel] = value;
        }
        break;
      }
    }
  }
}

void setup() {
  Serial.begin(115200);

  //Initialize SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  dmxModule.setDebug(DEBUG);
  httpModule.setDebug(DEBUG);
  websocketModule.setDebug(DEBUG);

  loadSettings();

  setStartupScene();
  initWifi();
<<<<<<< HEAD
=======
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
    dmxAutoLock = 2000;
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
    dmxAutoLock = 10000;
    delay(100);
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
>>>>>>> c1cc0655dbe009d2e00053f1832a09229a71eabb

  Serial.println("Init done");
  httpModule.startServer();
  dmxModule.enableOutput();
}

void loop(){
<<<<<<< HEAD
  dmxModule.loop();
  delay(20);
=======
  if (dmxManualLock) {
    return;
  }
  if (dmxAutoLock > 0) {
    delay(1000);
    dmxAutoLock -= 1000;
    return;
  }
  dmx_write_packet(dmxPort, dmxData, DMX_MAX_PACKET_SIZE);
  dmx_tx_packet(dmxPort);
  dmx_wait_tx_done(dmxPort, DMX_TX_PACKET_TOUT_TICK);
  delay(25);
>>>>>>> c1cc0655dbe009d2e00053f1832a09229a71eabb
}