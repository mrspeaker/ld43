import Events from "./Events.js";
import Mood from "./Mood.js";
import Peep from "./entities/Peep.js";
import PeepTypes from "./entities/PeepTypes.js";
import Farm from "./entities/Farm.js";
import Crop from "./entities/Crop.js";
import Patty from "./entities/Patty.js";
import Grinder from "./entities/Grinder.js";

class Game {
  constructor() {
    this.peeps = [...Array(10)].map(() => new Peep());
    this.time = 0;
    this.lastTick = 0;

    this.crops = [];
    this.produce = [];

    this.sausage = [];
    this.patties = [];
    this.grilled_patties = [];

    this.burgers = [];

    this.mana = 0;
    this.customers = [];

    this.farm = new Farm();
    this.grinder = new Grinder();
    this.mood = new Mood();

    Events.on("plotHarvested", this.onPlotHarvested.bind(this));
    Events.on("groundPeep", this.onGroundPeep.bind(this));
    Events.on("luckyCouple", this.onGetLucky.bind(this));
  }

  onPlotHarvested(plot) {
    plot.farmers.forEach(f => {
      f.peepType = PeepTypes.NOOB;
    });
    const crop = new Crop();
    this.crops.push(crop);
    Events.emit("newCrop", crop);
  }

  onGroundPeep(peep) {
    this.peeps = this.peeps.filter(p => p !== peep);
    console.log("there goes a good pattie.");
    const patty = new Patty();
    this.patties.push(patty);
    Events.emit("newPattie", peep, patty);
  }

  onGetLucky(peep1, peep2) {
    const baby = new Peep();
    this.peeps.push(baby);
    Events.emit("newPeep", baby, peep1, peep2);
  }

  addFarmer(peep) {
    this.farm.addFarmer(peep);
  }

  addBeefling(peep) {
    this.grinder.addBeefling(peep);
  }

  update(time, dt) {
    this.time += dt;
    if (this.time - this.lastTick > 300) {
      this.lastTick = this.time;
      this.tick();
    }
  }
  tick () {
    this.farm.tick();
    this.grinder.tick();
  }
}

export default Game;
