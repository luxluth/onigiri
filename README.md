<h1 style="display: flex; justify-content: space-between;">onigiri <img src="assets/onigiri.svg" style="height: 2em">
</h1>

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
npm install onigirijs

```

```ts
import { Onigiri } from '@luxluth/onigiri'

const player = vid = new Onigiri('#player', {
            source:{
                src: "https://example.com/video.mp4",
                type: 'video/mp4',
            },
            title: "Example video",
        });
```

## License

MIT
