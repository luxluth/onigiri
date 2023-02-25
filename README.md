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

## Example using Svelte

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import Onigiri from "@luxluth/onigiri"

    onMount(async () => {
        const player = new Onigiri("#video",{
            source : {
                src : '/src/video/omg.mp4',
                type : "video/mp4"
            },
            css : "width: 100%; height: 100vh;",
            videoName : "OMG",
            tracks: [
                {
                    kind: "subtitles",
                    label: "English",
                    srclang: "en",
                    default: true,
                    src: "/src/en.vtt",
                    type: "text/vtt",

                },
            ]
        })

        await player.load()
    })
</script>

<div id="video">
</div>
```

![example](https://raw.githubusercontent.com/luxluth/onigiri/main/assets/exemple2.png)

## License

MIT
