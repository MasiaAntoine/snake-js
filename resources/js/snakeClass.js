export class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    this.body = [{ x: 5, y: 5 }];
    this.direction = { x: 1, y: 0 };
    this.grow = false;
  }

  move() {
    let newHead = {
      x: this.body[0].x + this.direction.x,
      y: this.body[0].y + this.direction.y,
    };
    this.handleWrapAround(newHead);
    if (this.collidesWithBody(newHead)) {
      return false;
    }
    this.body.unshift(newHead);
    if (!this.grow) {
      this.body.pop();
    }
    this.grow = false;
    return true;
  }

  setDirection(x, y) {
    if (x !== -this.direction.x && y !== -this.direction.y) {
      this.direction = { x, y };
    }
  }

  handleWrapAround(head) {
    if (head.x < 0) head.x = 19;
    if (head.x > 19) head.x = 0;
    if (head.y < 0) head.y = 19;
    if (head.y > 19) head.y = 0;
  }

  collidesWithBody(position) {
    return this.body.some(
      (segment) => segment.x === position.x && segment.y === position.y
    );
  }

  eat() {
    this.grow = true;
  }
}
