import { WebVTTParser } from 'webvtt-parser';

function parse(VTTString: string) {
    const parser = new WebVTTParser();
    const tree = parser.parse(VTTString, 'metadata');
    console.log(tree)
}

export default parse