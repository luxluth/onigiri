# onigiri

A small fast and simple video player for the web.

## work in progress

Work in progress, not ready for production.
Available on:

- [X] chrome
- [X] firefox
- [X] edge
- [X] opera
- [ ] webkit
- [ ] safari

## Usage

```bash
npm install @luxluth/onigiri

```

```ts
import Onigiri from "@luxluth/onigiri"

const player = new Onigiri("#video",{
            source : {
                src : "src/video/file_example1920.mp4",
                type : "video/mp4"
            },
            css : "width: 100%; height: 100vh;",
            title : "Onigiri",
        })

await player.load()
```

## License

MIT
