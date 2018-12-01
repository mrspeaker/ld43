import Plot from "./Plot.js";
import Events from "../Events.js";

class Farm {
  constructor() {
    this.NUM_PLOTS = 6;
    this.plots = [...Array(this.NUM_PLOTS)].map(() => {
      const p = new Plot();
      return p;
    });
    Events.on("plotHarvested", (pp) => {
      console.log(pp);
    });
  }

  tick() {
    this.plots.forEach(p => p.tick());
  }

  addFarmer(peep) {
    this.plots[0].addFarmer(peep);
  }
}

export default Farm;
