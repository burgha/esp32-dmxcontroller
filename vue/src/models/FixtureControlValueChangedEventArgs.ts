import DMXCommand from "./DMXCommand"

export type FixtureControlValueChangedEventArgs = {
    commands: DMXCommand[];
}