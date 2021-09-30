import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Scene from './models/Scene'
import Group from './models/Group'
import Fixture from './models/Fixture'
import DMXCommand from './models/DMXCommand'

Vue.config.productionTip = false

loadSettings();

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

function loadSettings(): void {
    fetch(process.env.VUE_APP_API_URL + "/settings").then(res => {
        res.json().then(data => {
            const scenes: Scene[] = [];
            data.scenes?.forEach((e: any) => {
                scenes.push(new Scene(e._name));
            });
            store.commit('setScenes', scenes);

            const fixtures: Fixture[] = [];
            data.fixtures?.forEach((e: any) => {
                const sceneConfig: Map<Scene, DMXCommand[]> = new Map();
                e._sceneConfig.forEach((c: any) => {
                    const scene = store.state.scenes.find((s: Scene) => s.name === c._scene);
                    if (scene === undefined) {
                        return;
                    }
                    const commands: DMXCommand[] = [];
                    c._commands.forEach((command: any) => {
                        commands.push(new DMXCommand(command._channel, command._value));
                    });
                    sceneConfig.set(scene, commands);
                });
                fixtures.push(new Fixture(e._name, e._address, sceneConfig));
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
        })
    });
}