#pragma once
#include <Arduino.h>
#include <esp_dmx.h>

class DmxModule {
    public:
        DmxModule();
        void enableOutput();
        void disableOutput();
        bool getOutputState();
        void setData(int channel, int value);
        void loop();
        void setDebug(bool flag);
        byte dmxData[DMX_MAX_PACKET_SIZE];
    private:
        bool debug;
        dmx_port_t dmxPort = DMX_NUM_1;
        int dmxAutoLock = 0;
        bool dmxManualLock = true;
};