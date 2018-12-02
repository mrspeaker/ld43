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
import Car from "./entities/Car.js";

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
    this.cars = [];
    this.nextCar = 8000;

    this.loveShack = [];

    Events.on("plotHarvested", this.onPlotHarvested.bind(this));
    Events.on("groundPeep", this.onGroundPeep.bind(this));
    Events.on("luckyCouple", this.onGetLucky.bind(this));
    Events.on("grillComplete", this.onGrillComplete.bind(this));
    Events.on("orderFilled", this.onOrderFilled.bind(this));
    Events.on("carAtWindow", this.onCarAtWindow.bind(this));
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

  onOrderFilled(burger) {
    if (!this.cars.length) {
      console.log("no car for burgerz");
      this.burgers.push(burger);
      return;
    }
    // Get rid of the car.
    this.nextCar = Math.random() * 12000;
    const car = this.cars.shift();
    car.onOrderFilled && car.onOrderFilled(burger);
  }

  onCarAtWindow() {
    if (this.burgers.length) {
      // Got one wiaint!
      console.log("got one waiting!)");
      const burger = this.burgers.shift();
      this.onOrderFilled(burger);
    }
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

  sendACar() {
    const car = new Car();
    this.cars.push(car);
    Events.emit("newCar", car);
  }

  update(time, dt) {
    this.time += dt;
    if (this.time - this.lastTick > 300) {
      this.lastTick = this.time;
      this.tick();
    }
    if ((this.nextCar -= dt) < 0 && this.cars.length == 0) {
      this.sendACar();
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
