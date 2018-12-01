import Events from "./Events.js";
import Mood from "./Mood.js";
import Peep from "./entities/Peep.js";
import PeepTypes from "./entities/PeepTypes.js";
import Farm from "./entities/Farm.js";
import Crop from "./entities/Crop.js";

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

    this.mood = new Mood();

    Events.on("plotHarvested", this.onPlotHarvested.bind(this));
  }

  onPlotHarvested(plot) {
    plot.farmers.forEach(f => {
      f.peepType = PeepTypes.NOOB;
    });
    const crop = new Crop();
    this.crops.push(crop);
    Events.emit("newCrop", crop);
  }

  addFarmer(peep) {
    this.farm.addFarmer(peep);
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
  }
}

export default Game;
