const moods = [
  "DISBELIEVERS",
  "HYSTERICAL",
  "DISTRESSED",
  "PERTURBED",
  "CONCERNED",
  "UNHAPPY",
  "TRANQUIL",
  "HAPPY",
  "SATISFIED",
  "CONVIVIAL",
  "ENRAPTURED",
  "DELIRIOUS",
  "REJOICING"
];

class Mood {
  constructor() {
    this.index = (moods.length / 2) | 0;
  }
  mood() {
    const { index } = this;
    return moods[index];
  }
  change(amount) {
    const { index } = this;
    this.index = (index + amount + moods.length) % moods.length;
    return index;
  }
  inc() {
    return this.change(+1);
  }
  dec() {
    return this.change(-1);
  }
  rnd() {
    return this.change([-1, 0, 1][(Math.random() * 3) | 0]);
  }
}

export default Mood;
