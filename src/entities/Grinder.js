import Events from "../Events.js";

class Grinder {
  constructor() {
    this.beeflings = [];
  }

  tick() {
    this.beeflings = this.beeflings.filter(b => {
      const time = b.time += 1;
      if (time > 20) {
        Events.emit("groundPeep", b.peep);
        return false;
      }
      return true;
    });
  }

  addBeefling(peep) {
    this.beeflings.push({
      time: 0,
      peep
    });
  }
}

export default Grinder;
