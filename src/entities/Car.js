export class CarSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, data) {
    super(scene, x, y, "car");
    this._data = data;
  }
}

class Car {
  constructor() {
    this.name = "CAR_" + btoa(Math.random() * 1000)
      .substr((Math.random() * 4) | 0, 6)
      .toUpperCase();

    this.type = "CAR";
  }
}

export default Car;
