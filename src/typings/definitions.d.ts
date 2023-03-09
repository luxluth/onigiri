type CueSettings = {
    /**
     * Specifies the horizontal alignment of the cue text.
     * Valid values are `start`, `middle`, and `end`
     */
    align: "start" | "middle" | "end"

    /**
     * Specifies the vertical position of the cue text. 
     * The value can be specified in pixels `(px)` or as a percentage `(%)`.
     */
    position: string | number

    /**
     * Specifies the font size of the cue text. 
     * The value can be specified in pixels `(px)` or as a percentage `(%)`.
     */
    size: string | number

    /**
     * The vertical setting specifies the writing direction of the Cue text. 
     * The vertical setting can be set to one of three values: 
     *  `rl` (right-to-left), `lr` (left-to-right), or `auto`. The default value is auto.
     */
    vertical: "rl" | "lr" | "auto"

    /**
     * Specifies the region that the cue belongs to. 
     * Regions are defined using the `REGION` keyword and have a unique identifier.
     */
    region: any 

    /**
     * Specifies the line number that the cue appears on. This is used to position the cue within the `region`.
     */
    line: number

    /**
     * Specifies whether the cue should snap to the nearest line. Valid values are `true` and `false`.
     */
    "snap-to-lines": boolean

    /**
     * text-align: Specifies the text alignment of the cue. 
     * Valid values are `start`, `center`, `end`, and `left` (which is equivalent to start) 
     * and `right` (which is equivalent to end).
     */
    "text-align": "start" | "center" | "end" | "left" 

}
type Cue = {
    line: string
    start: number
    end: number
    settings: CueSettings
}

interface VTTList {
    list: Cue[]
    push(vtt: Cue): boolean
    search(time: number): Cue | null
}

interface VTTContainer {
    /**
     * setCurrent set the vtt to the current elem corresponding to the time
     * @param time 
     * @returns `true` or `false`
    */
   setCurrent(time: number): boolean
   current: Cue | null
   VTTs: VTTList
}