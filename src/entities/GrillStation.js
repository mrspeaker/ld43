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
    this.grillTime -= 1;
    if (this.grillTime <= 0) {
      this.grilling = false;
      this.grillTime = 5;
      this.meat = false;
      this.griller.anims.play("grill_idle");
      this.griller._data.working = false;
      Events.emit("grillComplete", { goodness: 1 });
    }
  }
  addGriller(peep) {
    this.griller = peep;
    this.griller._data.onChangeJobs = () => {
      this.griller = null;
    };
  }
  addMeat(meat) {
    this.meat = meat;
  }
}

export default GrillStation;
