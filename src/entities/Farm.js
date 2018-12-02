import Plot from "./Plot.js";
import Events from "../Events.js";

class Farm {
  constructor() {
    this.NUM_PLOTS = 6;
    this.plots = [...Array(this.NUM_PLOTS)].map(() => {
      const p = new Plot();
      return p;
    });
  }

  tick() {
    this.plots.forEach(p => p.tick());
  }

  addFarmer(peep) {
    const plot = this.plots.sort(p => p.farmers.length)[0];
    plot.addFarmer(peep);
  }
}

export default Farm;
