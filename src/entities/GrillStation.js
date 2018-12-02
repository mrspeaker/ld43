import Events from "../Events.js";
import data from "../data.js";

class GrillStation {
  constructor() {
    this.progress = 0;
    this.griller = null;
    this.meat = null;
    this.grilling = false;
    this.grillTime = data.GRILLING_BASE_TIME;
  }
  tick() {
    const { grilling, griller, meat } = this;
    if (!grilling || !griller || !meat) {
      return;
    }

    const grillerSkill = griller._data.culinary * data.GRILLING_SKILL_MULTIPIER;
    this.grillTime -= (1 + grillerSkill);
    if (this.grillTime <= 0) {
      this.grilling = false;
      this.grillTime = data.GRILLING_BASE_TIME;
      this.meat = false;
      this.griller.anims.play("grill_idle");
      this.griller._data.working = false;
      Events.emit("grillComplete", { goodness: 1 });
      Events.emit("workerFree", this.griller);
      this.griller = null;
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
