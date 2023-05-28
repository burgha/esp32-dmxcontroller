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

  Serial.println("Init done");
  dmxModule.enableOutput();
  httpModule.startServer();
}

void loop(){
  dmxModule.loop();
  delay(20);
}