#include <dmxmodule.h>

DmxModule::DmxModule()
{
    int transmitPin = 23;
    int receivePin = 22;
    int enablePin = 21;

    dmx_set_pin(dmxPort, transmitPin, receivePin, enablePin);
    dmx_driver_install(dmxPort, DMX_DEFAULT_INTR_FLAGS);
}

void DmxModule::enableOutput()
{
    this->dmxManualLock = false;
}

void DmxModule::disableOutput()
{
    this->dmxManualLock = false;
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