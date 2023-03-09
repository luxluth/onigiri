type Entities = {
    [key: string]: string;
}
declare module 'webvtt-parser' {
    declare class WebVTTParser {
        constructor(entities?: Entities)
        parse(input: string, mode: string)
    }
};