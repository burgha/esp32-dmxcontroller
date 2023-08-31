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
  File file;
  if (!SPIFFS.exists("/settings.json")) {
    File defaults = SPIFFS.open("/settings.default.json", "r");
    String jsonDefaults = defaults.readString();
    file = SPIFFS.open("/settings.json", "w+");
    file.print(jsonDefaults);
  } else {
    file = SPIFFS.open("/settings.json", "r");
  }
  String json = file.readString();
  file.close();

  deserializeJson(settings, json);

  if (DEBUG) {
    Serial.println(settings.as<String>());
  }
}

void createWifi(String ssid = "ESP32-DMX") {
  Serial.print("\nCreating WiFi Network ");
  Serial.println(ssid);
  WiFi.softAP(ssid);
}

boolean connectWifi(String ssid, String password) {
  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid.c_str(), password.c_str());
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    if (tries == 50) {
      WiFi.disconnect();
      return false;
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

  return true;
}

void initWifi() {
  if (!SPIFFS.exists("/settings.json")) {
    createWifi("ESP32-DMX");
  }
  int wifiMode = settings["config"]["_wifiMode"].as<int>();
  String apSsid = settings["config"]["_apSSID"].as<String>();

  String ssid = settings["config"]["_wifiCredentials"]["_ssid"].as<String>();
  String password = settings["config"]["_wifiCredentials"]["_password"].as<String>();

  if (wifiMode == 0 && ssid != "" && password != "") {
    if (!connectWifi(ssid, password)) {
      createWifi(apSsid);
    }
  } else {
    createWifi(apSsid);
  }
}

void setStartupScene() {
  String startupScene = settings["config"]["_startupScene"].as<String>();
  JsonArray fixtures = settings["fixtures"].as<JsonArray>();
  for(JsonVariant f : fixtures) {
    JsonVariant sceneConfig = f["_sceneConfig"];
    JsonArray sceneMap = sceneConfig["value"].as<JsonArray>();
    for(JsonVariant sc : sceneMap) {
      if (sc[0].as<String>() == startupScene) {
        Serial.print("Setting Startup Scene: ");
        Serial.println(startupScene);
        JsonArray cmds = sc[1].as<JsonArray>();
        for(JsonVariant cmd : cmds) {
          int channel = cmd["_channel"].as<int>();
          int value = cmd["_value"].as<int>();
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