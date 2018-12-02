import Events from "../Events.js";

class GrillStation {
  constructor() {
    this.progress = 0;
    this.griller = null;
    this.meat = null;
    this.grilling = false;
    this.grillTime = 5;
  }
  tick() {
    const { grilling, griller, meat } = this;
    if (!grilling || !griller || !meat) {
      return;
    }
    console.log("grilling!");
    this.grillTime -= 1;
    if (this.grillTime <= 0) {
      this.grilling = false;
      this.grillTime = 5;
      this.meat = false;
      Events.emit("grillComplete", { goodness: 1 });
    }
  }
  addGriller(peep) {
    this.griller = peep;
  }
  addMeat(meat) {
    this.meat = meat;
  }
}

export default GrillStation;
