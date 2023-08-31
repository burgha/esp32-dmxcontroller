#include <dmxmodule.h>

DmxModule::DmxModule()
{
    dmx_config_t config = DMX_CONFIG_DEFAULT;
    dmx_driver_install(dmxPort, &config, DMX_INTR_FLAGS_DEFAULT);
    dmx_set_pin(dmxPort, transmitPin, receivePin, enablePin);
}

void DmxModule::enableOutput()
{
    Serial.println("Enabling DMX");
    this->dmxManualLock = false;
}

void DmxModule::disableOutput()
{
    Serial.println("Disabling DMX");
    this->dmxManualLock = true;
}

bool DmxModule::getOutputState()
{
    return this->dmxManualLock;
}

void DmxModule::setData(int channel, int value)
{
    this->dmxData[channel] = value;
}

void DmxModule::loop()
{
    if (dmxManualLock)
    {
        return;
    }
    if (dmxAutoLock > 0)
    {
        delay(1000);
        dmxAutoLock -= 1000;
        return;
    }

    dmx_write(dmxPort, dmxData, DMX_PACKET_SIZE);
    dmx_send(dmxPort, DMX_PACKET_SIZE);
    dmx_wait_sent(dmxPort, DMX_TIMEOUT_TICK);
}

void DmxModule::setDebug(bool flag)
{
    this->debug = flag;
}