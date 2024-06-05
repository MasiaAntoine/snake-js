class Snake {
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

class EnemySnake {
  constructor() {
    this.reset();
    this.headImage = new Image();
    this.headImage.src = "resources/images/headSnakeRed.png";
    this.bodyImage = new Image();
    this.bodyImage.src = "resources/images/bodySnakeRed.png";
  }

  reset() {
    this.body = [{ x: 15, y: 15 }];
    this.direction = this.randomDirection();
    this.grow = false;
  }

  randomDirection() {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  move() {
    if (Math.random() < 0.1) {
      this.direction = this.randomDirection();
    }
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

class Fruit {
  constructor() {
    this.position = this.randomPosition();
  }

  randomPosition() {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  regenerate(snakeBodies) {
    let newPosition;
    do {
      newPosition = this.randomPosition();
      console.log("Trying new position:", newPosition);
    } while (
      snakeBodies.some((body) =>
        body.some(
          (segment) =>
            segment.x === newPosition.x && segment.y === newPosition.y
        )
      )
    );
    console.log("New fruit position:", newPosition);
    this.position = newPosition;
  }
}

class ScoreBoard {
  constructor() {
    this.scores = JSON.parse(localStorage.getItem("scores")) || [];
    this.scoreListElement = document.getElementById("scoreList");
    this.scoreForm = document.getElementById("scoreForm");
    this.usernameInput = document.getElementById("username");
    this.render();
  }

  addScore(score) {
    this.scores.push(score);
    this.scores.sort((a, b) => b.points - a.points);
    if (this.scores.length > 20) {
      this.scores.pop();
    }
    localStorage.setItem("scores", JSON.stringify(this.scores));
    this.render();
  }

  render() {
    this.scoreListElement.innerHTML = "";

    this.scores.forEach((score, index) => {
      const div = document.createElement("div");

      let rankingImage;

      switch (index + 1) {
        case 1:
          rankingImage = "resources/images/top1.png";
          div.classList.add("top-1");
          break;
        case 2:
          rankingImage = "resources/images/top2.png";
          div.classList.add("top-2");

          break;
        case 3:
          rankingImage = "resources/images/top3.png";
          div.classList.add("top-3");

          break;
        default:
          rankingImage = "";
      }

      if (rankingImage !== "") div.classList.add("flex-top");

      const imageElement = document.createElement("img");
      imageElement.src = rankingImage;
      imageElement.alt = `Rank ${index + 1}`;

      let topScore = "";
      if (index + 1 > 3) topScore = index + 1 + ".";

      div.textContent += `${topScore} ${score.username} - ${score.points}`;
      this.scoreListElement.appendChild(div);

      if (rankingImage !== "") div.appendChild(imageElement);
    });
  }

  checkIfHighScore(score) {
    return (
      this.scores.length < 20 ||
      score.points > this.scores[this.scores.length - 1].points
    );
  }

  showForm(callback) {
    this.scoreForm.classList.remove("hidden");
    this.scoreForm.onsubmit = (e) => {
      e.preventDefault();
      const username = this.usernameInput.value;
      if (username.length >= 6 && username.length <= 20) {
        callback(username);
        this.scoreForm.classList.add("hidden");
      }
    };
  }
}

class Game {
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
    this.enemyRespawnTimeout = null;

    this.headImage = new Image();
    this.headImage.src = "resources/images/headSnake.png";

    this.bodyImage = new Image();
    this.bodyImage.src = "resources/images/bodySnake.png";

    this.appleImage = new Image();
    this.appleImage.src = "resources/images/apple.png";

    this.enemySnake = new EnemySnake();
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

    if (this.enemyRespawnTimeout === null && !this.enemySnake.move()) {
      this.startEnemyRespawnTimer();
    }

    if (
      this.snake.body[0].x === this.fruit.position.x &&
      this.snake.body[0].y === this.fruit.position.y
    ) {
      console.log("Snake eats fruit at position:", this.fruit.position);
      this.snake.eat();
      this.fruit.regenerate([this.snake.body, this.enemySnake.body]);
      this.score += 10;
      this.updateScoreDisplay();
    }

    if (
      this.enemyRespawnTimeout === null &&
      this.enemySnake.body[0].x === this.fruit.position.x &&
      this.enemySnake.body[0].y === this.fruit.position.y
    ) {
      console.log("Enemy snake eats fruit at position:", this.fruit.position);
      this.enemySnake.eat();
      this.fruit.regenerate([this.snake.body, this.enemySnake.body]);
    }

    if (this.checkCollision()) {
      this.endGame();
      return;
    }

    this.draw();
  }

  checkCollision() {
    if (
      this.enemyRespawnTimeout === null &&
      this.enemySnake.body.some(
        (segment) =>
          segment.x === this.snake.body[0].x &&
          segment.y === this.snake.body[0].y
      )
    ) {
      return true;
    }

    if (
      this.snake.body.some(
        (segment) =>
          segment.x === this.enemySnake.body[0].x &&
          segment.y === this.enemySnake.body[0].y
      )
    ) {
      this.startEnemyRespawnTimer();
    }

    return false;
  }

  startEnemyRespawnTimer() {
    this.enemyRespawnTimeout = setTimeout(() => {
      this.enemySnake.reset();
      this.enemyRespawnTimeout = null;
    }, 5000);
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

    if (this.enemyRespawnTimeout === null) {
      this.ctx.drawImage(
        this.enemySnake.headImage,
        this.enemySnake.body[0].x * 30,
        this.enemySnake.body[0].y * 30,
        30,
        30
      );

      for (let i = 1; i < this.enemySnake.body.length; i++) {
        this.ctx.drawImage(
          this.enemySnake.bodyImage,
          this.enemySnake.body[i].x * 30,
          this.enemySnake.body[i].y * 30,
          30,
          30
        );
      }
    }
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

window.onload = () => {
  const game = new Game();
  game.start();
};
