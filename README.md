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
                crossorigin: "anonymous"
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
                    src: "/src/assets/dynamite-en.vtt",
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
