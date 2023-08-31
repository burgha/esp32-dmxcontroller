import type Fixture from "./Fixture";
import type FixtureControl from "./FixtureControl";
import type Group from "./Group";

export type KeyframeMapping = Map<Fixture, Map<number, Keyframe[]>>;

export default class Animation {
    private _name: string;

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    private _group: Group;

    public get group(): Group {
        return this._group;
    }

    public set group(group: Group) {
        this._group = group;
    }

    private _keyframes: KeyframeMapping;

    public get keyframes(): KeyframeMapping {
        return this._keyframes;
    }

    public set keyframes(keyframes: KeyframeMapping) {
        this._keyframes = keyframes;
    }

    public constructor(name: string = "", group: Group) {
        this._name = name;
        this._group = group;

        this._keyframes = new Map();
    }
}