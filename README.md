# onigiri

A small fast and simple video player for the web.

[![CI](https://github.com/luxluth/onigiri/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/luxluth/onigiri/actions/workflows/main.yml)
[![Publish](https://github.com/luxluth/onigiri/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/luxluth/onigiri/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/v/@luxluth/onigiri?style=flat&logo=npm&color=fedcba)](https://www.npmjs.com/package/@luxluth/onigiri)

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
pnpm add @luxluth/onigiri
```
```bash
npm install @luxluth/onigiri
```

## Example using Svelte

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import Onigiri from "@luxluth/onigiri"

    onMount(async () => {
        const player = new Onigiri("#video",{
            source : {
                src : [
                    {
                        href: 'http://localhost:8000/video/dynamite.mp4',
                        type : "video/mp4"
                    }
                ],
                crossorigin: "anonymous",
                attr: {
                    autoplay: true
                }
            },
            css : "width: 100%; height: 100vh;",
            videoName : "Dynamite",
            alternateName: "BTS",
            tracks: [
                {
                    kind: "subtitles",
                    label: "English",
                    srclang: "en",
                    default: true,
                    src: "http://localhost:8000/file/dynamite-en.vtt",
                    type: "text/vtt",
                }
            ],
        })

        await player.load()
    })
</script>
```

![example](https://raw.githubusercontent.com/luxluth/onigiri/main/assets/exemple4.png)

## License

MIT
