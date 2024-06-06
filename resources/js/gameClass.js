import { Snake } from "./snakeClass.js";
import { Fruit } from "./fruitClass.js";
import { ScoreBoard } from "./scoreBoardClass.js";

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
    this.snake = new Snake();
    this.fruit = new Fruit();
    this.score = 0;
    this.scoreBoard = new ScoreBoard();
    this.interval = null;
    this.initControls();
    this.scoreDisplay = document.getElementById("scoreDisplay");

    this.headImage = new Image();
    this.headImage.src = "resources/images/headSnake.png";

    this.bodyImage = new Image();
    this.bodyImage.src = "resources/images/bodySnake.png";

    this.appleImage = new Image();
    this.appleImage.src = "resources/images/apple.png";
  }

  initControls() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.snake.setDirection(0, -1);
          break;
        case "ArrowDown":
          this.snake.setDirection(0, 1);
          break;
        case "ArrowLeft":
          this.snake.setDirection(-1, 0);
          break;
        case "ArrowRight":
          this.snake.setDirection(1, 0);
          break;
      }
    });
  }

  start() {
    this.interval = setInterval(() => this.gameLoop(), 100);
  }

  gameLoop() {
    if (!this.snake.move()) {
      this.endGame();
      return;
    }
    if (
      this.snake.body[0].x === this.fruit.position.x &&
      this.snake.body[0].y === this.fruit.position.y
    ) {
      this.snake.eat();
      this.fruit.regenerate(this.snake.body);
      this.score += 10;
      this.updateScoreDisplay();
    }
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(
      this.headImage,
      this.snake.body[0].x * 30,
      this.snake.body[0].y * 30,
      30,
      30
    );

    for (let i = 1; i < this.snake.body.length; i++) {
      this.ctx.drawImage(
        this.bodyImage,
        this.snake.body[i].x * 30,
        this.snake.body[i].y * 30,
        30,
        30
      );
    }

    this.ctx.drawImage(
      this.appleImage,
      this.fruit.position.x * 30,
      this.fruit.position.y * 30,
      30,
      30
    );
  }

  updateScoreDisplay() {
    this.scoreDisplay.textContent = `Score: ${this.score}`;
  }

  endGame() {
    clearInterval(this.interval);
    const scoreEntry = { username: "", points: this.score };
    if (this.scoreBoard.checkIfHighScore(scoreEntry)) {
      this.scoreBoard.showForm((username) => {
        scoreEntry.username = username;
        this.scoreBoard.addScore(scoreEntry);
      });
    }
  }
}
