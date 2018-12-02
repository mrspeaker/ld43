import Events from "./Events.js";
import Mood from "./Mood.js";
import Peep from "./entities/Peep.js";
import PeepTypes from "./entities/PeepTypes.js";
import Farm from "./entities/Farm.js";
import Crop from "./entities/Crop.js";
import Patty from "./entities/Patty.js";
import Grinder from "./entities/Grinder.js";
import Grill from "./entities/Grill.js";
import CookedMeat from "./entities/CookedMeat.js";
import Burger from "./entities/Burger.js";

class Game {
  constructor() {
    this.peeps = [...Array(10)].map(() => new Peep());
    this.time = 0;
    this.lastTick = 0;

    this.farm = new Farm();
    this.grinder = new Grinder();
    this.grill = new Grill();

    this.produce = [];
    this.cooked_meat = [];
    this.burgers = [];

    this.mood = new Mood();

    this.loveShack = [];

    Events.on("plotHarvested", this.onPlotHarvested.bind(this));
    Events.on("groundPeep", this.onGroundPeep.bind(this));
    Events.on("luckyCouple", this.onGetLucky.bind(this));
    Events.on("grillComplete", this.onGrillComplete.bind(this));
  }

  onPlotHarvested(plot) {
    plot.farmers.forEach(f => {
      f.peepType = PeepTypes.NOOB;
    });
    const crop = new Crop();
    this.produce.push(crop);
    Events.emit("newCrop", crop);
  }

  onGroundPeep(peep) {
    const patty = new Patty();
    this.grill.patties.push(patty);

    this.peeps = this.peeps.filter(p => p !== peep);
    Events.emit("newPattie", peep, patty);
  }

  onGetLucky(peep1, peep2) {
    const baby = new Peep();
    this.peeps.push(baby);
    Events.emit("newPeep", baby, peep1, peep2);
  }

  addLoveShacker(peep) {
    this.loveShack.push(peep);
    if (this.loveShack.length >= 2) {
      const baby = new Peep();
      this.peeps.push(baby);
      Events.emit("newPeep", baby, this.loveShack[0], this.loveShack[1]);
    }
  }

  onGrillComplete(meat_stats) {
    const meat = new CookedMeat();
    this.cooked_meat.push(meat);
    Events.emit("newCookedMeat", meat);
  }

  addFarmer(peep) {
    this.farm.addFarmer(peep);
  }

  addBeefling(peep) {
    this.grinder.addBeefling(peep);
  }

  addGriller(peep) {
    this.grill.addGriller(peep);
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
    this.grill.tick();

    if (this.produce.length && this.cooked_meat.length) {
      // Remove from lists,
      const produce = this.produce.shift();
      const meat = this.cooked_meat.shift();
      produce._sprite.destroy();
      meat._sprite.destroy();

      const burger = new Burger(produce, meat);
      Events.emit("newBurger", burger);
      // REmove sprites
      // Add new burger.
    }
  }
}

export default Game;
