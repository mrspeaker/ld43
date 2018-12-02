import Events from "../Events.js";

class Grinder {
  constructor() {
    this.beeflings = [];
  }

  tick() {
    this.beeflings = this.beeflings.filter(b => {
      const time = b.time += 1;
      if (time > 5) {
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
    Events.emit("grindingPeep", peep);
    peep.working = true;
    peep._sprite.anims.play("grinded");
  }
}

export default Grinder;
