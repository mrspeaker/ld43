import Events from "../Events.js";

class Plot {
  constructor() {
    this.progress = 0;
    this.farmers = [];
    this.tilling = true;
  }
  tick() {
    const { tilling, farmers } = this;
    if (!tilling || farmers.length == 0) {
      return;
    }

    this.progress += farmers.length * 10;
    if (this.progress > 100) {
      this.tilling = false;
      Events.emit("plotHarvested", this);
    }
  }
  addFarmer(peep) {
    this.farmers.push(peep);
  }
}

export default Plot;
