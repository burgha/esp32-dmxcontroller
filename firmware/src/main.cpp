#include <Arduino.h>

#include <SPIFFS.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <wifi_credentials.h>
#include <esp_dmx.h>

int transmitPin = 23;
int receivePin = 22;
int enablePin = 21;

dmx_port_t dmxPort = DMX_NUM_1;
byte dmxData[DMX_MAX_PACKET_SIZE];
bool dmxAutoLock = false;
bool dmxManualLock = true;

AsyncWebServer server(80);

// Variable to store the HTTP request
String header;

// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

void setup() {
  Serial.begin(115200);

  //Initialize SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  // Init DMX
  const dmx_config_t config = DMX_DEFAULT_CONFIG;
  dmx_param_config(dmxPort, &config);
  dmx_set_pin(dmxPort, transmitPin, receivePin, enablePin);
  QueueHandle_t dmx_queue;
  dmx_driver_install(dmxPort, DMX_MAX_PACKET_SIZE, 10, &dmx_queue, ESP_INTR_FLAG_IRAM);
  dmx_set_mode(dmxPort, DMX_MODE_TX);

  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(wifi_ssid);
  WiFi.begin(wifi_ssid, wifi_password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/api/settings", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("-> Settings");
    delay(100);
    File file = SPIFFS.open("/settings.json", "r");
    String data = file.readString();
    file.close();
    Serial.println(data);
    request->send(200, "application/json", data);
    delay(100);
  });

  server.on("/api/settings", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
    Serial.println("<- Settings");
    delay(100);

    if (data[0] != 123) {
      Serial.println("Invalid settings received. ignoring");
      for(size_t i=0; i<len; i++){
        Serial.print(data[i]);
      }
      request->send(400);
      return;
    }

    File file = SPIFFS.open("/settings.json", "w");
    for(size_t i=0; i<len; i++){
      Serial.print(data[i]);
      file.write(data[i]);
    }
    file.close();
    Serial.println();
    request->send(200);
    delay(100);
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

  server.on("/api/dmx", HTTP_POST, [](AsyncWebServerRequest *request){
    int params = request->params();
    for(int i=0;i<params;i++){
      AsyncWebParameter* p = request->getParam(i);
      uint16_t channel = p->name().toInt();
      uint8_t value = p->value().toInt();

      if (dmxData[channel] != value) {
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
    SPIFFS.remove("/settings.json");
    request->send(200);
  });

  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");

  server.onNotFound([](AsyncWebServerRequest *request) {
    if (request->method() == HTTP_OPTIONS) {
        request->send(200);
        return;
    }

    Serial.print("Request: ");
    Serial.println(request->url());
    String url = request->url();
    if (url == "/") {
      dmxAutoLock = true;
      File file = SPIFFS.open("/index.html", "r");
      String data = file.readString();
      request->send(200, "text/html", data);
    } else if (url == "/favicon.ico") {
      dmxAutoLock = true;
      File file = SPIFFS.open("/favicon.ico", "r");
      String data = file.readString();
      request->send(200, "image/x-icon", data);
    } else if (url == "/js/app.js") {
      dmxAutoLock = true;
      request->send(SPIFFS, "/js/app.js", "text/javascript");
    }
  });

  server.begin();
}

void loop(){
  if (dmxManualLock) {
    return;
  }
  if (dmxAutoLock) {
    delay(5000);
    dmxAutoLock = false;
  }
  dmx_write_packet(dmxPort, dmxData, DMX_MAX_PACKET_SIZE);
  dmx_tx_packet(dmxPort);
  dmx_wait_tx_done(dmxPort, DMX_TX_PACKET_TOUT_TICK);
  //Serial.println("DMX Tick");
  delay(50);
}