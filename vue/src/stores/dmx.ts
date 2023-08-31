import Fixture from '@/models/Fixture'
import Group from '@/models/Group'
import Scene from '@/models/Scene'
import Config from '@/models/Config'
import Animation from '@/models/Animation'
import type DMXControllable from '@/models/DMXControllable'
import WSService from '@/services/WSService'
import { defineStore } from 'pinia'
import FixtureControl from '@/models/FixtureControl'
import DMXCommand from '@/models/DMXCommand'
import { debounce } from '@/utils/debounce'

let persistStateDebouncedHandler: Function;

export const useDmxStore = defineStore('dmx', {
    state: () => ({
        scenes: [] as Scene[],
        groups: [] as Group[],
        fixtures: [] as Fixture[],
        animations: [] as Animation[],
        config: new Config(),
        dmxData: new Array(513).fill(0),
        dmxEnabled: true,
        activeScene: new Map<DMXControllable, Scene>()
    }),
    actions: {
        async persistState() {
            if (this.config.useWebsockets) {
                if (!WSService.getInstance().send('settings', this.convertStateToJson())) {
                    //Fallback HTTP
                    await sendConfigHTTP(this);
                }
            } else {
                await sendConfigHTTP(this);
            }
        },
        async persistStateDebounced() {
            if (!persistStateDebouncedHandler) {
                persistStateDebouncedHandler = debounce(this.persistState, 2000);
            }
            persistStateDebouncedHandler();
        },
        loadSettings(): Promise<void> {
            function deserializeFixtureControl(x: any) {
                return new FixtureControl(x._name, x._type, x._config);
            }

            function deserializeDmxCommand(x: any) {
                return new DMXCommand(x._channel, x._value);
            }

            function deserializeFixture(x: any) {
                const map = new Map();
                x._sceneConfig.forEach((val: any, key: string) => {
                    map.set(key, val.map((c: any) => deserializeDmxCommand(c)));
                });
                return new Fixture(x._name, x._address, x._numChannels, map, x._controls?.map((c: any) => deserializeFixtureControl(c)) ?? []);
            }

            function deserializeGroup(x: any, fixtures: Fixture[]) {
                return new Group(x._name, x._members?.map((m: any) => fixtures.find(x => x.name === m._name)) ?? []);
            }

            function deserializeScene(x: any) {
                return new Scene(x._name);
            }

            function deserializeAnimation(x: any) {
                return new Animation(x._name, x._group);
            }

            function reviver(this: any, key: any, value: any) {
                if (typeof value === 'object' && value !== null) {
                    if (value.dataType === 'Map') {
                        return new Map(value.value);
                    }
                }
                return value;
            }

            return new Promise((resolve, reject) => {
                fetch(import.meta.env.VITE_APP_API_URL + "/settings").then(res => res.text()).then((text) => {
                    const data = JSON.parse(text, reviver);
                    
                    data.scenes = data.scenes?.map((x: any) => deserializeScene(x)) ?? [];
                    data.fixtures = data.fixtures?.map((x: any) => deserializeFixture(x)) ?? [];
                    data.groups = data.groups?.map((x: any) => deserializeGroup(x, data.fixtures)) ?? [];
                    data.animations = data.animations?.map((x: any) => deserializeAnimation(x)) ?? [];
                    
                    const map = new Map();
                    data.activeScene?.forEach((value: DMXControllable, key: Scene) => {
                        key = [...data.fixtures, ...data.groups].find((c: Fixture | Group) => c.name === (key as any)._name);
                        value = data.scenes.find((s: Scene) => s.name === (value as any)._name);
                        map.set(key, value);
                    });
                    data.activeScene = map;

                    data.dmxEnabled = true; // Unabhängig von Settings nach boot immer aktiv

                    this.$patch(data);
                    console.log("Loaded Settings", data);
                    
                    resolve();
                }).catch(() => {
                    reject();
                });
            });
        },
        sendDMXData() {
            if (this.config.useWebsockets) {
                if (!WSService.getInstance().send('dmx', JSON.stringify(this.dmxData))) {
                    //Fallback HTTP
                    sendDMXDataHTTP(this);
                }
            } else {
                sendDMXDataHTTP(this);
            }
            this.persistStateDebounced();
        },
        getDMXData() {
            fetch(import.meta.env.VITE_APP_API_URL + "/dmx").then(res => res.json()).then(d => {
                d.forEach((value: number, index: number) => {
                    this.setDMXData(index, value);
                });
            }); (this);
        },
        sendDMXState() {
            if (this.config.useWebsockets) {
                if (!WSService.getInstance().send('dmxState', this.dmxEnabled)) {
                    //Fallback HTTP
                    sendDMXStateHttp(this);
                }
            } else {
                sendDMXStateHttp(this);
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
        convertStateToJson(): string {
            function replacer(this: any, key: any, value: any) {
                if (value instanceof Map) {
                    return {
                        dataType: 'Map',
                        value: Array.from(value.entries()),
                    };
                } else {
                    return value;
                }
            }
            
            return JSON.stringify(this.$state, replacer);
        },
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
    fetch(import.meta.env.VITE_APP_API_URL + '/dmx?' + query, { method: "POST" });
}

function sendDMXStateHttp(store: any) {
    if (store.$state.dmxEnabled) {
        fetch(import.meta.env.VITE_APP_API_URL + '/enable', { method: "POST" });
    } else {
        fetch(import.meta.env.VITE_APP_API_URL + '/disable', { method: "POST" });
    }
}
