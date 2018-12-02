import PeepTypes from "./PeepTypes.js";

const Phaser = window.Phaser;

export class PeepSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "peeps");
    this.setOrigin(0.5, 1);
    this.setInteractive();
    // NOTE: "data" is used internally in Phaser :()
    this._data = data;
    data._sprite = this; // Sorry :)
  }
}

class Peep {
  constructor() {
    this.name = btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();
    this.type = "PEEP";
    this.peepType = PeepTypes.NOOB;
    this.working = true; // Born working, yo.
    this.hp = 0;
    this.botany = 0;
    this.culinary = 0;
    this.age = 0;
    this.flavor = 0;
    this.draggable = true;
  }
}

export default Peep;
