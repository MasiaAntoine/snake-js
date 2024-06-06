export class Fruit {
  constructor() {
    this.position = this.randomPosition();
  }

  randomPosition() {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  regenerate(snakeBody) {
    let newPosition;
    do {
      newPosition = this.randomPosition();
    } while (
      snakeBody.some(
        (segment) => segment.x === newPosition.x && segment.y === newPosition.y
      )
    );
    this.position = newPosition;
  }
}
