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
    this.neutral = (moods.length / 2) | 0;
    this.index = this.neutral;
  }
  mood() {
    const { index } = this;
    return moods[index];
  }
  change(amount) {
    const { index } = this;
    this.index = Math.max(0, Math.min(moods.length - 1, index + amount));
    return this.index;
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
