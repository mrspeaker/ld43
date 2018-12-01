import { PeepSprite } from "../entities/Peep.js";
import { CropSprite } from "../entities/Crop.js";
import PeepTypes from "../entities/PeepTypes.js";
import Game from "../Game.js";
import Events from "../Events.js";

const Phaser = window.Phaser;

const isIn = (go, minX, minY, maxX, maxY) => {
  return go.x >= minX && go.x < maxX && go.y >= minY && go.y < maxY;
};

const Areas = {
  Incubator: [119, 88, 233, 136],
  Queue: [3, 81, 110, 141],
  Farm: [1, 144, 113, 220],
  Kitchen: [140, 147, 229, 237],
  Grinder: [148, 141, 223, 275],
  CropSpawn: [118, 154, 130 + 16, 144 + 16]
};

class Main extends Phaser.Scene {
  constructor() {
    super({ key: "Main" });

    Events.on("newCrop", crop => {
      console.log("new crop yo");
      const sprite = new CropSprite(
        this,
        Areas.CropSpawn[0],
        Areas.CropSpawn[1],
        crop
      );
      this.add.existing(sprite);
      // sprite.on("pointerdown", () => {
      //   sprite.setTint(0xff0000);
      //   this.displayInfo(sprite);
      // });
      // sprite.on("pointerup", () => {
      //   sprite.clearTint();
      // });

      const t = this.tweens.createTimeline();
      t.add({
        targets: sprite,
        y: Areas.CropSpawn[1] + 100,
        duration: 5000
      });
      t.play();
    });
  }
  preload() {
    this.load.image("bg", "res/sgb.png");
    this.load.image("char", "res/char1.png");
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

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("peeps", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

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

    this.add.bitmapText(0, 10, "font", "SHAREHOLDERS ARE");
    const mood = this.add.bitmapText(100, 10, "font", this.game.mood.mood());
    mood.setTint(0xff00ff);

    //dialog.visible = false;
    this.dialog = dialog;

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

    setInterval(() => {
      this.game.mood.rnd();
      mood.text = this.game.mood.mood();
    }, 1000);

    this.peeps = [...Array(10)].map((_, i) => {
      const p = new PeepSprite(this, 0, 0, this.game.peeps[i]);
      this.assignPeep(p, PeepTypes.NOOB);
      this.add.existing(p);
      //this.input.setDraggable(p);
      return p;
    });

    this.add.bitmapText(0, 84, "font", "JOB SEEKERS");
    this.add.bitmapText(176, 126, "font", "INCUBATOR");
    this.add.bitmapText(0, 146, "font", "THE FARM");
    this.add.bitmapText(156, 156, "font", "THE GRILL");
    this.add.bitmapText(152, 246, "font", "THE GRINDER");

    let selected = null;
    let dragSelected = false;
    let hovered = null;

    this.input.on("gameobjectover", (pointer, gameObject) => {
      // if (hovered) {
      //   hovered.clearTint();
      // }
      // hovered = gameObject
      // this.displayInfo(gameObject);
      // gameObject.setTint(0xff0000);
    });

    this.input.on("gameobjectout", function(pointer, gameObject) {
      //gameObject.clearTint();
    });

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      //if (gameObject.data.type !== "PEEP") return;

      // Nothing selected
      if (!selected) {
        selected = gameObject;
        dragSelected = false;
        gameObject.setTint(0xff0000);
        this.displayInfo(gameObject);

        gameObject.downX = pointer.downX;
        gameObject.downY = pointer.downY;
        return;
      }
      // Double clicked self - draggin'
      if (
        !dragSelected &&
        gameObject.data.draggable &&
        selected === gameObject
      ) {
        dragSelected = true;
        return;
      }

      selected.clearTint();
      // TODO: see if it's dropped on anybody
      const mate = this.droppedOnAMate(selected);
      if (dragSelected && mate) {
        console.log("aww, you found woneone!", mate);
        selected = null;
        return;
      } else {
        if (gameObject.data.draggable) {
          this.assignFromXY(selected);
        }
      }

      // Clicked on yourself
      if (selected === gameObject) {
        selected = null;
        return;
      }
      // Clicked on a new peep
      selected = gameObject;
      dragSelected = false;
      gameObject.setTint(0xff0000);
      this.displayInfo(gameObject);

      // if (selected ) {
      //   console.log("was!");
      //   this.assignFromXY(selected);
      //   selected = null;
      // } else {
      //   selected = gameObject;
      // }
    });
    this.input.on("gameobjectup", function(pointer, gameObject) {
      //  gameObject.clearTint();
    });
    this.input.on("pointermove", p => {
      //console.log(p.downX, p.downY, p);
      if (selected && dragSelected) {
        selected.x = p.x;
        selected.y = p.y;
      }
    });
    this.input.on("pointerdown", p => {
      //console.log(p.downX, p.downY, p);
      // if (selected) {
      //   selected.clearTint();
      //   selected = null;
      // }
    });
    // this.input.on("dragstart", (pointer, ent) => {
    //   ent.setTint(0xff0000);
    //   ent.downX = pointer.downX;
    //   ent.downY = pointer.downY;
    //
    //   this.displayInfo(ent);
    // });
    //
    // this.input.on("drag", (pointer, ent, dragX, dragY) => {
    //   ent.x = dragX;
    //   ent.y = dragY;
    // });
    //
    // this.input.on("dragend", (pointer, ent) => {
    //   ent.clearTint();
    //   this.assignFromXY(ent);
    // });
  }

  update(time, dt) {
    this.game.update(time, dt);
    if (Math.random() < 0.01) {
      const noobs = this.peeps.filter(p => p.data.peepType === PeepTypes.NOOB);
      if (noobs.length) {
        this.assignPeep(noobs[0], PeepTypes.UNASSIGNED);
      }
    }
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
      return PeepTypes.CHEF;
    }
    if (isIn(peep, ...Areas.Grinder)) {
      return PeepTypes.MEAT;
    }
    return PeepTypes.OFF_THE_GRID;
  }

  assignFromXY(peep) {
    const area = this.getAreaFromXY(peep);
    if (area == PeepTypes.NOOB) {
      this.revertDrag(peep);
    }
    if (area == PeepTypes.OFF_THE_GRID) {
      this.revertDrag(peep);
    } else {
      if (area !== peep.data.peepType) {
        this.assignPeep(peep, area);
      }
    }
  }

  revertDrag(peep) {
    const t = this.tweens.createTimeline();
    t.add({
      targets: peep,
      x: peep.downX,
      y: peep.downY
    });
    t.play();
  }

  assignPeep(peep, type) {
    peep.data.peepType = type;
    if (type == PeepTypes.NOOB) {
      const [minX, minY, maxX, maxY] = Areas.Incubator;
      peep.x = Phaser.Math.Between(minX, maxX);
      peep.y = Phaser.Math.Between(minY, maxY);
    }
    if (type == PeepTypes.UNASSIGNED) {
      this.growUp(peep);
    }
    if (type == PeepTypes.FARMER) {
      this.game.addFarmer(peep.data);
    }
  }

  displayInfo(ent) {
    const { dialog } = this;
    const txt = dialog.first;
    txt.text = ent.data.name + " - " + ent.data.type + " " + ent.data.peepType;
    dialog.visible = true;
  }

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
    const gs = this.peeps.filter(p => p.data.peepType === PeepTypes.UNASSIGNED);

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

    timeline.play();
  }
}

export default Main;
