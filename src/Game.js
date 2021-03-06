import Events from "./Events.js";
import data from "./data.js";
import Mood from "./Mood.js";
import Peep from "./entities/Peep.js";
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
    this.peeps = this.initPeeps();
    this.time = 0;
    this.lastTick = 0;

    this.farm = new Farm();
    this.grinder = new Grinder();
    this.grill = new Grill();

    this.produce = [];
    this.produce_in_transit = [];
    this.cooked_meat = [];
    this.cooked_meat_in_transit = [];
    this.burgers = []; // TODO: needed?

    this.mood = new Mood();
    this.cars = [];
    this.nextCar = 8000;

    this.loveShack = [];
    this.loveShackTime = 0;

    Events.on("plotHarvested", this.onPlotHarvested.bind(this));
    Events.on("groundPeep", this.onGroundPeep.bind(this));
    Events.on("grillComplete", this.onGrillComplete.bind(this));
    Events.on("orderFilled", this.onOrderFilled.bind(this));
    Events.on("carAtWindow", this.onCarAtWindow.bind(this));
    Events.on("cookedMeatHasArrived", this.onMeatHasArrived.bind(this));
    Events.on("produceHasArrived", this.onProduceHasArrived.bind(this));
  }

  initPeeps() {
    // Set initial stats
    return [...Array(10)].map(() => new Peep()).map(p => {
      p.culinary = Math.random() * 3 | 0;
      p.botany = Math.random() * 3 | 0;
      p.tenderness = Math.random() * 3 | 0;
      p.virility = Math.random() * 3 | 0;
      return p;
    });
  }

  onPlotHarvested(plot) {
    plot.farmers.forEach(f => {
      //f.peepType = PeepTypes.NOOB;
      Events.emit("workerFree", f);
    });
    const crop = new Crop();
    this.produce_in_transit.push(crop);
    Events.emit("newCrop", crop);
  }

  onGroundPeep(peep) {
    const patty = new Patty();
    this.grill.patties.push(patty);

    this.peeps = this.peeps.filter(p => p !== peep);
    Events.emit("newPattie", peep, patty);
  }

  addLoveShacker(peepSprite) {
    if (this.loveShackTime > 0) {
      Events.emit("jobRejection", peepSprite);
      return;
    }

    this.loveShack.push(peepSprite);
    peepSprite._data.onChangeJobs = () => {
      this.loveShack = this.loveShack.filter(p => p === this);
    };
    peepSprite.anims.play("peep_idle");
    if (this.loveShack.length >= 2) {
      Events.emit("loveStarts");
      this.loveShack.forEach(l => {
        l._data.working = true;
        l.visible = false;
      });
      this.loveShackTime = 4000;
    }
  }

  onGrillComplete(meat_stats) {
    const meat = new CookedMeat();
    this.cooked_meat_in_transit.push(meat);
    Events.emit("newCookedMeat", meat);
  }

  onMeatHasArrived(meat) {
    // Meeded to calc queue lenght
    this.cooked_meat_in_transit = this.cooked_meat_in_transit.filter(
      m => m != meat
    );
    this.cooked_meat.push(meat);
  }

  onProduceHasArrived(meat) {
    // Meeded to calc queue lenght
    this.produce_in_transit = this.produce_in_transit.filter(
      m => m != meat
    );
    this.produce.push(meat);
  }

  onOrderFilled(burger) {
    if (!this.cars.length) {
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

    if (this.loveShackTime > 0) {
      if ((this.loveShackTime -= dt) < 0) {
        const baby = new Peep();
        this.peeps.push(baby);
        this.calcOffspringStats(baby, ...this.loveShack);
        Events.emit("newPeep", baby, ...this.loveShack);
        this.loveShack = [];
      }
    }
  }

  calcOffspringStats(baby, p1, p2) {
    // Equal votes for parent and baby - but weighted to parents
    const parentPower = data.PARENT_INFLUENCE;
    const pcw = (p1._data.culinary + p2._data.culinary) * parentPower;
    const bc = Math.random() * 4 | 0;
    baby.culinary = Math.round((bc + pcw) / 3);

    const pbw = (p1._data.botany + p2._data.botany) * parentPower;
    baby.botany = Math.round(((Math.random() * 4 | 0) + pbw) / 3);

    const ptw = (p1._data.tenderness + p2._data.tenderness) * parentPower;
    baby.tenderness = Math.round(((Math.random() * 4 | 0) + ptw) / 3);

    const pvw = (p1._data.virility + p2._data.virility) * parentPower;
    baby.virility = Math.round(((Math.random() * 4 | 0) + pvw) / 3);
  }

  tick() {
    this.farm.tick();
    this.grinder.tick();
    this.grill.tick();

    // Do we have the ingredients for a burger?
    if (this.produce.length && this.cooked_meat.length) {
      // Remove from lists,
      const produce = this.produce.shift();
      const meat = this.cooked_meat.shift();
      // Kill sprites
      produce._sprite.destroy();
      meat._sprite.destroy();

      // TODO: never added to burger array - is array needed?
      const burger = new Burger(produce, meat);
      Events.emit("newBurger", burger);
    }
  }
}

export default Game;
