import DMXCommand from '@/models/DMXCommand'
import Fixture from '@/models/Fixture'
import Group from '@/models/Group'
import Scene from '@/models/Scene'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        scenes: [],
        groups: [],
        fixtures: []
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
        }
    },
    actions: {
        persistState(context: any) {
            persistState(context.state);
        }
    },
    modules: {
    }
})

function persistState(state: any): void {
    let data = JSON.parse(JSON.stringify(state));
    const fixtures = data.fixtures;
    fixtures.forEach((fixture: any) => {
        fixture._sceneConfig = [];
        const f = state.fixtures.find((x: Fixture) => x.name === fixture._name);
        f.sceneConfig.forEach((val: DMXCommand, key: Scene) => {
            fixture._sceneConfig.push({
                _scene: key.name,
                _command: val
            });
        });
    });
    data.fixtures = fixtures;
    data = JSON.stringify(data);

    fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data,
    })
}