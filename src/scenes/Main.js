import { PeepSprite } from "../entities/Peep.js";
import { CropSprite } from "../entities/Crop.js";
import { PlotSprite } from "../entities/Plot.js";
import { CookedMeatSprite } from "../entities/CookedMeat.js";
import { BurgerSprite } from "../entities/Burger.js";
import { PattySprite } from "../entities/Patty.js";
import { CarSprite } from "../entities/Car.js";
import PeepTypes from "../entities/PeepTypes.js";
import Game from "../Game.js";
import Events from "../Events.js";

const Phaser = window.Phaser;

const isIn = (go, minX, minY, maxX, maxY) => {
  return go.x >= minX && go.x < maxX && go.y >= minY && go.y < maxY;
};

const Areas = {
  Incubator: [120, 88, 190, 136],
  Queue: [3, 81, 110, 141],
  Farm: [3, 146, 111, 221],
  Kitchen: [140, 147, 229, 237],
  Grinder: [148, 239, 223, 275],
  LoveShack: [196, 62, 236, 123],
  CropSpawn: [118, 144],
  PattySpawn: [210, 290],
  CookedSpawn: [136, 144],
  BurgerSpawn: [127, 240],
  CarSpawn: [-100, 300]
};

const HoverableAreas = [
  Areas.Queue,
  Areas.Farm,
  Areas.Kitchen,
  Areas.Grinder,
  Areas.LoveShack
].map(
  ([x1, y1, x2, y2]) => new Phaser.Geom.Rectangle(x1, y1, x2 - x1, y2 - y1)
);

class Main extends Phaser.Scene {
  constructor() {
    super({ key: "Main" });

    // TODO: this is mostly to sync the display
    // with the Game, but it didn't work very nicely ;)
    // TODO: REFACToR!
    this.handleCustomGameEvents();
  }
  preload() {
    this.load.image("bg", "res/sgb.png");
    this.load.image("bgfg", "res/sgbgb.png");
    this.load.image("car", "res/car.png");
    this.load.image("char", "res/char1.png");
    this.load.image("roof", "res/roof.png");
    this.load.spritesheet("peeps", "res/peeps.png", {
      frameWidth: 8,
      frameHeight: 12
    });
    this.load.spritesheet("chars", "res/chars.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.image("font", "res/font.png");
  }

  create() {
    this.game = new Game();

    this.add.image(120, 160, "bg");

    const mouse = this.add.sprite(40, 40, "chars");
    mouse.setOrigin(0, 0);
    mouse.setFrame(10);
    this.children.bringToTop(mouse);
    mouse.depth = 1000;

    // Created here for z-ordering.
    // TODO: create some containrs instead!
    this.game.farm.createPlots();

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("peeps", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "belt_down",
      frames: this.anims.generateFrameNumbers("chars", { start: 20, end: 23 }),
      frameRate: 3,
      repeat: -1
    });

    this.addConveyorBelts();

    const font_config = {
      image: "font",
      width: 6,
      height: 8,
      chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
      charsPerRow: 10,
      spacing: { x: 0, y: 0 }
    };

    const dialog = this.add.container(0, 0);

    this.cache.bitmapFont.add(
      "font",
      Phaser.GameObjects.RetroFont.Parse(this, font_config)
    );

    const title = this.add.bitmapText(0, 20, "font", "LD41");
    dialog.add(title);
    title.setTint(0xff00ff);

    this.add.bitmapText(0, 10, "font", "STEAKHOLDERS ARE");
    const mood = this.add.bitmapText(100, 10, "font", this.game.mood.mood());
    mood.setTint(0xff00ff);

    //dialog.visible = false;
    this.dialog = dialog;

    this.addGraphAndCharts();

    setInterval(() => {
      this.game.mood.rnd();
      mood.text = this.game.mood.mood();
    }, 1000);

    this.add.bitmapText(0, 84, "font", "JOB SEEKERS");
    this.add.bitmapText(176, 126, "font", "LOVE SHACK");
    this.add.bitmapText(1, 147, "font", "THE FARM");
    this.add.bitmapText(156, 156, "font", "THE GRILL");
    this.add.bitmapText(153, 259, "font", "THE GRINDER");

    this.peeps = [...Array(10)].map((_, i) => {
      return this.createAPeepSprite(this.game.peeps[i]);
    });

    const fg = this.add.container();
    fg.add(this.add.image(176, 56, "bgfg"));
    fg.add(this.add.image(123, 240, "roof"));
    fg.depth = 500;

    this.hoverHelper = this.add.graphics();

    this.handlePointer(mouse);
  }

  update(time, dt) {
    this.game.update(time, dt);
    if (Math.random() < 0.01) {
      const noobs = this.peeps.filter(p => p._data.peepType === PeepTypes.NOOB);
      if (noobs.length) {
        this.assignPeep(noobs[0], PeepTypes.UNASSIGNED);
      }
    }
  }

  handlePointer(mouse) {
    // INPUT Handling:  TODO: MOVE this!
    let selected = null;
    let dragSelected = false;

    this.input.on("pointermove", pointer => {
      mouse.x = pointer.x;
      mouse.y = pointer.y;

      this.hoverHelper.visible = false;
      if (dragSelected) {
        // Check if hovering
        const mouseBounds = mouse.getBounds();
        HoverableAreas.forEach(rect => {
          const collide = Phaser.Geom.Rectangle.Overlaps(mouseBounds, rect);
          if (collide) {
            this.hoverHelper.clear();
            this.hoverHelper.lineStyle(1, 0x00ff00, 1);
            this.hoverHelper.strokeRect(rect.x, rect.y, rect.width, rect.height);
            this.hoverHelper.visible = true;
          }
        });
      }
    });

    this.input.on("pointerdown", pointer => {
      //console.log(pointer.x, pointer.y);
    });

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      // Nothing selected
      if (!selected) {
        selected = gameObject;
        dragSelected = false;
        gameObject.setTint(0x00ff00);
        this.displayInfo(gameObject);

        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
        return;
      }
      // Error reverting if switch to different peep...
      if (selected !== gameObject) {
        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
      }

      // Double clicked self - draggin'
      if (
        !dragSelected &&
        gameObject._data.draggable &&
        selected === gameObject
      ) {
        dragSelected = true;
        if (gameObject._timeline) {
          gameObject._timeline.stop();
          gameObject._timeline = null;
        }
        gameObject.setTint(0xff00ff);
        return;
      }

      selected.clearTint();

      if (dragSelected && gameObject._data.draggable) {
        this.assignFromXY(selected);
        dragSelected = false;
        selected = null;
        return;
      }

      // Clicked on yourself
      if (selected === gameObject) {
        selected = null;
        dragSelected = false;
        return;
      }
      // Clicked on a new peep
      selected = gameObject;
      dragSelected = false;
      gameObject.setTint(0x00ff00);
      this.displayInfo(gameObject);
    });

    this.input.on("pointermove", p => {
      if (selected && dragSelected) {
        selected.x = p.x;
        selected.y = p.y;
      }
    });
  }

  addGraphAndCharts() {
    const line1 = this.add.graphics();
    const line2 = this.add.graphics();
    line1.lineStyle(1, 0x00ff00, 1);
    line2.lineStyle(1, 0xe43b44, 1);
    line1.beginPath();
    line2.beginPath();

    line1.moveTo(0, 40);
    line2.moveTo(0, 60);
    const yo = 60;
    for (var i = 0; i < 25; i++) {
      line1.lineTo(i * 10, (yo + Math.random() * 20) | 0);
      line2.lineTo(i * 10, (yo + Math.random() * 20) | 0);
    }
    line1.strokePath();
    line2.strokePath();
  }

  addConveyorBelts() {
    // Make some belts
    for (let i = 0; i < 8; i++) {
      if (i < 6) {
        const b1 = this.add.sprite(120, 160 + i * 16 - 8, "chars");
        b1.anims.play("belt_down");
        const b2 = this.add.sprite(120 + 16, 160 + i * 16 - 8, "chars");
        b2.anims.play("belt_down", false, 1);
      }
      const b3 = this.add.sprite(216 + 16, 160 + i * 16 - 8, "chars");
      b3.setScale(1, -1);
      b3.anims.play("belt_down");
    }
    for (let i = 0; i < 2; i++) {
      const s1 = this.add.sprite(110 + i * 16, 279, "chars");
      s1.setRotation(Math.PI / 2);
      s1.anims.play("belt_down");

      const b1 = this.add.sprite(128, 257 + i * 16 - 8, "chars");
      b1.anims.play("belt_down");
    }
  }

  createAPeepSprite(peepData) {
    const p = new PeepSprite(this, 0, 0, peepData);
    this.assignPeep(p, PeepTypes.NOOB);
    this.add.existing(p);
    return p;
  }

  getAreaFromXY(peep) {
    if (isIn(peep, ...Areas.Incubator)) {
      return PeepTypes.NOOB;
    }
    if (isIn(peep, ...Areas.Queue)) {
      return PeepTypes.UNASSIGNED;
    }
    if (isIn(peep, ...Areas.Farm)) {
      return PeepTypes.FARMER;
    }
    if (isIn(peep, ...Areas.Kitchen)) {
      return PeepTypes.GRILLER;
    }
    if (isIn(peep, ...Areas.Grinder)) {
      return PeepTypes.MEAT;
    }
    if (isIn(peep, ...Areas.LoveShack)) {
      return PeepTypes.MATE;
    }

    return PeepTypes.OFF_THE_GRID;
  }

  assignFromXY(peep) {
    const area = this.getAreaFromXY(peep);
    if (area == PeepTypes.NOOB || area == PeepTypes.OFF_THE_GRID) {
      this.revertDrag(peep);
    } else {
      if (area !== peep._data.peepType) {
        this.assignPeep(peep, area);
      }
    }
  }

  revertDrag(peep) {
    const t = this.tweens.createTimeline();
    t.add({
      targets: peep,
      x: peep.downX,
      y: peep.downY,
      duration: 200
    });
    t.play();
  }

  assignPeep(peep, type) {
    peep._data.peepType = type;
    if (type == PeepTypes.NOOB) {
      const [minX, minY, maxX, maxY] = Areas.Incubator;
      peep.x = Phaser.Math.Between(minX, maxX);
      peep.y = Phaser.Math.Between(minY, maxY);
    }
    if (type == PeepTypes.UNASSIGNED) {
      this.growUp(peep);
    }
    if (type == PeepTypes.FARMER) {
      this.game.addFarmer(peep._data);
    }
    if (type == PeepTypes.MEAT) {
      this.game.addBeefling(peep._data);
    }
    if (type == PeepTypes.MATE) {
      this.game.addLoveShacker(peep);
    }
    if (type == PeepTypes.GRILLER) {
      this.game.addGriller(peep);
    }
  }

  displayInfo(ent) {
    const { dialog } = this;
    const txt = dialog.first;
    txt.text =
      ent._data.name + " - " + ent._data.type + " " + ent._data.peepType;
    dialog.visible = true;
  }

  // TODO: Not used anymore
  droppedOnAMate(peep) {
    const peepBounds = peep.getBounds();
    for (let i = 0; i < this.peeps.length; i++) {
      const peep2 = this.peeps[i];
      if (peep2 === peep) continue;
      const collide = Phaser.Geom.Rectangle.Overlaps(
        peepBounds,
        peep2.getBounds()
      );
      if (collide) {
        return peep2;
      }
    }
    return null;
  }

  growUp(peep) {
    const gs = this.peeps.filter(
      p => p._data.peepType === PeepTypes.UNASSIGNED
    );

    const timeline = this.tweens.createTimeline();

    let xo = Areas.Queue[2] - 10;
    let yo = Areas.Queue[1] + 16;

    timeline.add({
      targets: peep,
      x: xo,
      y: yo
    });

    timeline.add({
      targets: peep,
      x: (xo -= 85),
      duration: 2000
    });

    timeline.add({
      targets: peep,
      y: (yo += 15),
      duration: 500
    });

    timeline.add({
      targets: peep,
      x: (xo += 80),
      duration: 2000
    });

    timeline.add({
      targets: peep,
      y: (yo += 20),
      duration: 500
    });

    timeline.add({
      targets: peep,
      x: 20 + (gs.length - 1) * 10,
      duration: 500
    });

    peep._timeline = timeline;

    timeline.play();
  }

  handleCustomGameEvents() {
    Events.on("newCrop", crop => {
      const sprite = new CropSprite(
        this,
        Areas.CropSpawn[0],
        Areas.CropSpawn[1],
        crop
      );
      this.add.existing(sprite);
      crop._sprite = sprite;

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.CropSpawn[1] + 96 - this.game.produce.length * 16,
        duration: 5000
      });
      t.play();
    });

    Events.on("newPlot", (plot, x, y) => {
      const sprite = new PlotSprite(this, x, y, plot);
      //sprite.depth = 200;
      sprite.visible = false;
      this.add.existing(sprite);
      plot._sprite = sprite;
    });

    Events.on("newCookedMeat", meat => {
      const sprite = new CookedMeatSprite(
        this,
        Areas.CookedSpawn[0],
        Areas.CookedSpawn[1],
        meat
      );
      this.add.existing(sprite);
      meat._sprite = sprite;
      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.CookedSpawn[1] + 96 - this.game.cooked_meat.length * 16,
        duration: 5000
      });
      t.play();
    });

    Events.on("newPattie", (peep, patty) => {
      // Turn a peep into a patty
      patty.readyToCook = false;
      this.peeps = this.peeps.filter(p => {
        if (p._data === peep) {
          p.destroy();

          const sprite = new PattySprite(
            this,
            Areas.PattySpawn[0],
            Areas.PattySpawn[1],
            patty
          );
          this.add.existing(sprite);
          patty._sprite = sprite;

          const t = this.tweens.createTimeline();
          t.add({
            targets: sprite,
            x: Areas.PattySpawn[0] + 20,
            duration: 500
          });
          t.add({
            targets: sprite,
            y: Areas.PattySpawn[1] - 146 + this.game.grill.patties.length * 16,
            duration: 4000,
            onComplete: () => {
              patty.readyToCook = true;
            }
          });
          t.play();

          return false;
        }
        return true;
      });
    });

    Events.on("newPeep", (baby, parent1, parent2) => {
      const peep = this.createAPeepSprite(baby);
      this.peeps.push(peep);
      this.assignPeep(parent1, PeepTypes.UNASSIGNED);
      this.assignPeep(parent2, PeepTypes.UNASSIGNED);
    });

    Events.on("newCar", car => {
      const sprite = new CarSprite(
        this,
        Areas.CarSpawn[0],
        Areas.CarSpawn[1],
        car
      );
      this.add.existing(sprite);
      car._sprite = sprite;

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        x: 50,
        duration: 3000,
        ease: "Cubic",
        onComplete: () => {
          Events.emit("carAtWindow", car);
        }
      });
      t.play();

      car.onOrderFilled = burger => {
        const t = this.tweens.createTimeline();
        t.add({
          targets: [sprite, burger._sprite],
          x: 320,
          duration: 4000,
          ease: "CubicOut",
          onComplete: () => {
            car._sprite.destroy();
            burger._sprite.destroy();
          }
        });
        t.play();
      };
    });

    Events.on("newBurger", burger => {
      const sprite = new BurgerSprite(
        this,
        Areas.BurgerSpawn[0],
        Areas.BurgerSpawn[1],
        burger
      );
      this.add.existing(sprite);
      burger._sprite = sprite;

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.BurgerSpawn[1] + 39,
        duration: 3000
      });
      t.add({
        targets: sprite,
        x: Areas.BurgerSpawn[0] - 22,
        duration: 1000,
        onComplete: () => {
          sprite.x = 85;
          sprite.y = 300;
          Events.emit("orderFilled", burger);
        }
      });
      t.play();
    });
  }
}

export default Main;
