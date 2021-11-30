import DMXCommand from '@/models/DMXCommand'
import Fixture from '@/models/Fixture'
import Group from '@/models/Group'
import Scene from '@/models/Scene'
import Config from '@/models/Config'
import Vue from 'vue'
import Vuex from 'vuex'
import WifiCredentials from '@/models/WifiCredentials'
import FixtureControl from '@/models/FixtureControl'
import DMXControllable from '@/models/DMXControllable'
import WSService from '@/services/WSService'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        scenes: [],
        groups: [],
        fixtures: [],
        config: new Config(),
        dmxData: new Array(513).fill(0),
        dmxEnabled: true,
        activeScene: new Map<DMXControllable, Scene>()
    },
    mutations: {
        setScenes(state, scenes: Scene[]) {
            state.scenes = scenes as never[];
        },
        setGroups(state, groups: Group[]) {
            state.groups = groups as never[];
        },
        setFixtures(state, fixtures: Fixture[]) {
            state.fixtures = fixtures as never[];
        },
        setConfig(state, config: Config) {
            state.config = config as never;
        },
        setDMXData(state, {channel, value}) {
            state.dmxData[channel] = value as never;
        },
        setDMXEnabled(state, value: boolean) {
            state.dmxEnabled = value as never;
            if (value) {
                fetch(process.env.VUE_APP_API_URL + '/enable', {method: "POST"});
            } else {
                fetch(process.env.VUE_APP_API_URL + '/disable', {method: "POST"});
            }
        },
        setActiveScene(state, {target, scene}) {
            state.activeScene.set(target as DMXControllable, scene as Scene);
        }
    },
    actions: {
        persistState(context: any) {
            persistState(context);
        },
        loadSettings(context: any) {
            loadSettings(context);
        },
        sendDMXData(context: any) {
            sendDMXData(context);
        },
        getDMXData(context: any) {
            getDMXData(context);
        }
    },
    modules: {
    }
})

async function persistState(store: any): Promise<void> {
    if (store.state.config.useWebsockets) {
        if(!WSService.getInstance().send('settings', await convertStateToJson(store.state))) {
            //Fallback HTTP
            //sendConfigHTTP(store);
        }
    } else {
        sendConfigHTTP(store);
    }
}

async function sendConfigHTTP(store: any): Promise<void> {
    fetch(process.env.VUE_APP_API_URL + '/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: await convertStateToJson(store.state),
    })
}

function loadSettings(store: any): void {
    fetch(process.env.VUE_APP_API_URL + "/settings").then(res => {
        res.json().then(data => {
            importObjectIntoStore(data, store);
        })
    });
}

function sendDMXData(store: any) {
    if (store.state.config.useWebsockets) {
        if(!WSService.getInstance().send('dmx', JSON.stringify(store.state.dmxData))) {
            //Fallback HTTP
            sendDMXDataHTTP(store);
        }
    } else {
        sendDMXDataHTTP(store);
    }
}

function sendDMXDataHTTP(store: any): void {
    let query = "";
    store.state.dmxData.forEach((value: number, channel: number) => {
        query += channel + "=" + value + "&";
    });
    query = query.substring(0, query.length - 1); // remove last &
    fetch(process.env.VUE_APP_API_URL + '/dmx?' + query, {method: "POST"});
}

function getDMXData(store: any) {
    fetch(process.env.VUE_APP_API_URL + "/dmx").then(res => res.json()).then(d => {
        d.forEach((value: number, index: number) => {
            store.commit('setDMXData', {channel: index, value: value});
        });
    });
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

export async function convertStateToJson(state: any): Promise<string> {
    let data = {
        scenes: await state.scenes,
        groups: await state.groups,
        fixtures: await state.fixtures,
        config: await state.config
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
        const f = state.fixtures.find((x: Fixture) => x.name === fixture._name);
        f.sceneConfig.forEach((val: DMXCommand[], key: Scene) => {
            fixture._sceneConfig.push({
                _scene: key.name,
                _commands: val
            });
        });
    });
    data.fixtures = fixtures;

    let json = JSON.stringify(data);
    
    // Compression
    compressionMap.forEach((val: string, key: string) => {
        json = json.replaceAll(key, val);
    });
    return json;
}

export function importObjectIntoStore(data: any, store: any): void {
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
    store.commit('setScenes', scenes);

    const fixtures: Fixture[] = [];
    data.fixtures?.forEach((e: any) => {
        const sceneConfig: Map<Scene, DMXCommand[]> = new Map();
        e._sceneConfig?.forEach((c: any) => {
            const scene = store.state.scenes.find((s: Scene) => s.name === c._scene);
            if (scene === undefined) {
                return;
            }
            const commands: DMXCommand[] = [];
            c._commands?.forEach((command: any) => {
                commands.push(new DMXCommand(command._channel, command._value));
            });
            sceneConfig.set(scene, commands);
        });
        const controls: FixtureControl[] = [];
        e._controls?.forEach((control: any) => {
            controls.push(new FixtureControl(control._name, control._type, control._config));
        });
        fixtures.push(new Fixture(e._name, e._address, e._numChannels, sceneConfig, controls));
    });
    store.commit('setFixtures', fixtures);

    const groups: Group[] = [];
    data.groups?.forEach((e: any) => {
        const members: Fixture[] = [];
        e._members.forEach((m: any) => {
            const fixture = store.state.fixtures.find((f: Fixture) => f.name === m._name);
            if (fixture === undefined) {
                return;
            }
            members.push(fixture);
        });
        groups.push(new Group(e._name, members));
    });
    store.commit('setGroups', groups);

    const config = new Config();
    config.wifiCredentials = new WifiCredentials(data.config._wifiCredentials._ssid, data.config._wifiCredentials._password);
    config.useWebsockets = data.config._useWebsockets;
    config.startupScene = data.config._startupScene;
    store.commit('setConfig', config);
}