class Cues implements VTTList {
    list: Cue[];
  
    constructor() {
      this.list = [];
    }
  
    public push(vtt: Cue) {
      const index = this.binarySearch(vtt.start, 0, this.list.length - 1);
      this.list.splice(index, 0, vtt);
      return true;
    }
  
    public search(time: number) {
      const index = this.binarySearch(time, 0, this.list.length - 1);
      const vtt = this.list[index];
  
      if (vtt && time >= vtt.start && time < vtt.end) {
        return vtt;
      }
  
      return null;
    }
  
    private binarySearch(time: number, start: number, end: number): number {
      if (end <= start) {
        //@ts-ignore
        return time > this.list[start].start ? start + 1 : start;
      }
  
      const mid = Math.floor((start + end) / 2);
      //@ts-ignore
      if (this.list[mid].start === time) {
        return mid;
      }
      //@ts-ignore
      if (this.list[mid].start < time) {
        return this.binarySearch(time, mid + 1, end);
      }
  
      return this.binarySearch(time, start, mid - 1);
    }
}
  

class VTTContainer implements VTTContainer {
    public current: Cue | null;
    public VTTs: VTTList;
  
    constructor() {
      this.current = null;
      this.VTTs = new Cues();
    }
  
    public setCurrent(time: number): boolean {
      const vtt = this.VTTs.search(time);
  
      if (vtt) {
        this.current = vtt;
        return true;
      }
  
      this.current = null;
      return false;
    }
}