import Plot from "./Plot.js";
import Events from "../Events.js";

class Farm {
  constructor() {
    this.NUM_PLOTS = 6;
    this.plots = [];
  }

  createPlots() {
    [...Array(this.NUM_PLOTS)].forEach((_, i) => {
      const p = new Plot();
      Events.emit("newPlot", p, (i % 3) * 32 + 16, (i / 3|0) * 32 + 160);
      this.plots.push(p);
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
