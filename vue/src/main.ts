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
    // const scenes: Scene[] = [
    //     new Scene("Off"),
    //     new Scene("Colorloop"),
    //     new Scene("Strobe"),
    //     new Scene("Red")
    // ]
    // const groups: Group[] = [];
    // const fixtures: Fixture[] = [];
    // const g1 = new Group("Strahler");
    // const g2 = new Group("Außen");
    // const f1 = new Fixture("Strahler1", 0);
    // const f2 = new Fixture("Strahler2", 50);
    // f1.setSceneConfig(scenes[2], new DMXCommand(6, 255));
    // f2.setSceneConfig(scenes[2], new DMXCommand(6, 255));
    // f1.setSceneConfig(scenes[3], new DMXCommand(1, 255));
    // f2.setSceneConfig(scenes[3], new DMXCommand(1, 255));
    // g1.members.push(f1)
    // g1.members.push(f2);
    // g2.members.push(f2);
    // groups.push(g1);
    // groups.push(g2);
    // fixtures.push(f1);
    // fixtures.push(f2);

    //eslint-disable-next-line
    
    fetch("http://localhost:3000/api/settings").then(res => {
        res.json().then(data => {
            const scenes: Scene[] = [];
            data.scenes?.forEach((e: any) => {
                scenes.push(new Scene(e._name));
            });
            store.commit('setScenes', scenes);

            const fixtures: Fixture[] = [];
            data.fixtures?.forEach((e: any) => {
                const sceneConfig: Map<Scene, DMXCommand> = new Map();
                e._sceneConfig.forEach((c: any) => {
                    const scene = store.state.scenes.find((s: Scene) => s.name === c._scene);
                    if (scene === undefined) {
                        return;
                    }
                    sceneConfig.set(scene, new DMXCommand(c._command._channel, c._command._value));
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