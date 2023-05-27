import DMXCommand from '@/models/DMXCommand'
import Fixture from '@/models/Fixture'
import Group from '@/models/Group'
import Scene from '@/models/Scene'
import Config from '@/models/Config'
import WifiCredentials from '@/models/WifiCredentials'
import FixtureControl from '@/models/FixtureControl'
import type DMXControllable from '@/models/DMXControllable'
import WSService from '@/services/WSService'
import { defineStore } from 'pinia'

export const useDmxStore = defineStore('dmx', {
    state: () => ({
        scenes: [] as Scene[],
        groups: [] as Group[],
        fixtures: [] as Fixture[],
        config: new Config(),
        dmxData: new Array(513).fill(0),
        dmxEnabled: true,
        activeScene: new Map<DMXControllable, Scene>()
    }),
    actions: {
        async persistState() {
            if (this.config.useWebsockets) {
                if(!WSService.getInstance().send('settings', await this.convertStateToJson())) {
                    //Fallback HTTP
                    await sendConfigHTTP(this);
                }
            } else {
                await sendConfigHTTP(this);
            }
        },
        loadSettings() {
            fetch(import.meta.env.VITE_APP_API_URL + "/settings").then(res => {
                res.json().then(data => {
                    this.importObjectIntoStore(data);
                })
            });
        },
        sendDMXData() {
            if (this.config.useWebsockets) {
                if(!WSService.getInstance().send('dmx', JSON.stringify(this.dmxData))) {
                    //Fallback HTTP
                    sendDMXDataHTTP(this);
                }
            } else {
                sendDMXDataHTTP(this);
            }
        },
        getDMXData() {
            fetch(import.meta.env.VITE_APP_API_URL + "/dmx").then(res => res.json()).then(d => {
                d.forEach((value: number, index: number) => {
                    this.setDMXData(index, value);
                });
            });(this);
        },
        sendDMXState() {
            if (this.dmxEnabled) {
                fetch(import.meta.env.VITE_APP_API_URL + '/enable', {method: "POST"});
            } else {
                fetch(import.meta.env.VITE_APP_API_URL + '/disable', {method: "POST"});
            }
        },
        setScenes(scenes: Scene[]) {
            this.scenes = scenes as never[];
        },
        setGroups(groups: Group[]) {
            this.groups = groups as never[];
        },
        setFixtures(fixtures: Fixture[]) {
            this.fixtures = fixtures as never[];
        },
        setConfig(config: Config) {
            this.config = config as never;
        },
        setDMXData(channel: number, value: number) {
            this.dmxData[channel] = value as never;
        },
        setDMXEnabled(value: boolean) {
            this.dmxEnabled = value as never;
        },
        setActiveScene(target: DMXControllable, scene: Scene) {
            this.activeScene.set(target, scene);
        },
        async convertStateToJson(): Promise<string> {
            let data = {
                scenes: await this.scenes,
                groups: await this.groups,
                fixtures: await this.fixtures,
                config: await this.config
            }
            data = JSON.parse(JSON.stringify(data));
        
            data.groups = data.groups.map((g: any) => {
                return {
                    ...g,
                    _members: g._members.map((f: any) => {return {_name: f._name}})
                }
            });
        
            const fixtures = data.fixtures;
            fixtures.forEach((fixture: any) => {
                fixture._sceneConfig = [];
                const f = this.fixtures.find(x => x.name === fixture._name);
                if (f) {
                    f.sceneConfig.forEach((val: DMXCommand[], key: Scene) => {
                        fixture._sceneConfig.push({
                            _scene: key.name,
                            _commands: val
                        });
                    });
                }
            });
            data.fixtures = fixtures;
        
            let json = JSON.stringify(data);
            
            // Compression
            compressionMap.forEach((val: string, key: string) => {
                json = json.replaceAll(key, val);
            });
            return json;
        },
        importObjectIntoStore(data: any) {
            // Decompression
            data = JSON.stringify(data);
            compressionMap.forEach((val: string, key: string) => {
                data = data.replaceAll(val, key);
            });
            data = JSON.parse(data);
        
            const scenes: Scene[] = [];
            data.scenes?.forEach((e: any) => {
                scenes.push(new Scene(e._name));
            });
            this.setScenes(scenes);
        
            const fixtures: Fixture[] = [];
            data.fixtures?.forEach((e: any) => {
                const sceneConfig: Map<Scene, DMXCommand[]> = new Map();
                e._sceneConfig?.forEach((c: any) => {
                    const scene = this.scenes.find(s => s.name === c._scene);
                    if (scene === undefined) {
                        return;
                    }
                    const commands: DMXCommand[] = [];
                    c._commands?.forEach((command: any) => {
                        commands.push(new DMXCommand(command._channel, command._value));
                    });
                    sceneConfig.set(scene as Scene, commands);
                });
                const controls: FixtureControl[] = [];
                e._controls?.forEach((control: any) => {
                    controls.push(new FixtureControl(control._name, control._type, control._config));
                });
                fixtures.push(new Fixture(e._name, e._address, e._numChannels, sceneConfig, controls));
            });
            this.setFixtures(fixtures);
        
            const groups: Group[] = [];
            data.groups?.forEach((e: any) => {
                const members: Fixture[] = [];
                e._members.forEach((m: any) => {
                    const fixture = this.fixtures.find(f => f.name === m._name);
                    if (fixture === undefined) {
                        return;
                    }
                    members.push(fixture as Fixture);
                });
                groups.push(new Group(e._name, members));
            });
            this.setGroups(groups);
        
            const config = new Config();
            config.wifiCredentials = new WifiCredentials(data.config._wifiCredentials._ssid, data.config._wifiCredentials._password);
            config.useWebsockets = data.config._useWebsockets;
            config.startupScene = data.config._startupScene;
            this.setConfig(config);
        }
    },
});

async function sendConfigHTTP(store: any): Promise<Response> {
    return fetch(import.meta.env.VITE_APP_API_URL + '/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: await store.convertStateToJson(store.$state),
    })
}

function sendDMXDataHTTP(store: any): void {
    let query = "";
    store.$state.dmxData.forEach((value: number, channel: number) => {
        query += channel + "=" + value + "&";
    });
    query = query.substring(0, query.length - 1); // remove last &
    fetch(import.meta.env.VITE_APP_API_URL + '/dmx?' + query, {method: "POST"});
}

const compressionMap = new Map<string, string>([
    ['"fixtures"', '"*fs"'],
    ['"scenes"', '"*scs"'],
    ['"groups"', '"*gs"'],
    ['"_name"', '"*n"'],
    ['"_scene"', '"*s"'],
    ['"_channel"', '"*c"'],
    ['"_command"', '"*co"'],
    ['"_commands"', '"*cs"'],
    ['"_value"', '"*v"'],
    ['"_address"', '"*a"'],
    ['"_numChannels"', '"*nC"'],
    ['"_sceneConfig"', '"*sC"'],
    ['"_wifiCredentials"', '"*w"'],
    ['"_ssid"', '"*ss"'],
    ['"_password"', '"*p"'],
    ['"_controls"', '"*cts"'],
    ['"_type"', '"*t"'],
    ['"_members"', '"*m"'],
    ['"_config"', '"*cf"'],
    ['"_useWebsockets"', '"*uW"'],
    ['"_startupScene"', '"*sSc"'],
]);