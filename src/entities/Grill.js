import GrillStation from "./GrillStation.js";

class Grill {
  constructor() {
    this.grillStations = [];
    this.NUM_STATIONS = 6;
    this.grillStations = [...Array(this.NUM_STATIONS)].map(() => {
      const s = new GrillStation();
      return s;
    });
    this.patties = [];
  }

  tick() {
    // Find patty that is ready.
    const patty = this.patties.find(p => p.readyToCook);
    if (patty) {
      // Find stations that are not grillling, and have worker.
      const station = this.grillStations.find(s => !s.grilling && s.griller);
      if (station) {
        // Grill.
        station.addMeat(patty);
        station.grilling = true;
        this.removePatty(patty);
        station.griller.anims.play("grill_action");
        station.griller._data.working = true;
      }
    }

    this.grillStations.forEach(s => s.tick());
  }

  removePatty(patty) {
    this.patties = this.patties.filter(p => p != patty);
    // REFACTOR! Data shouldn't know about phaser.
    patty._sprite.destroy();
  }

  addGriller(peep) {
    const station = this.grillStations.find(s => !s.griller);
    if (station) {
      station.addGriller(peep);
      peep.anims.play("grill_idle");
    } else {
      console.warn("no room for you, griller...");
    }
  }
}

export default Grill;
