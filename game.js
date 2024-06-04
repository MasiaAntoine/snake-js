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
    this.render(); // Mettre à jour l'affichage du tableau des scores
  }

  render() {
    this.scoreListElement.innerHTML = "";
    this.scores.forEach((score, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${score.username} - ${score.points}`;
      this.scoreListElement.appendChild(li);
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
    this.canvas.width = 600; // Largeur du canevas
    this.canvas.height = 600; // Hauteur du canevas
    this.ctx = this.canvas.getContext("2d");
    this.snake = new Snake();
    this.fruit = new Fruit();
    this.score = 0;
    this.scoreBoard = new ScoreBoard();
    this.interval = null;
    this.initControls();
    this.scoreDisplay = document.getElementById("scoreDisplay");

    // Charger l'image de la tête du serpent
    this.headImage = new Image();
    this.headImage.src = "headSnake.png";

    // Charger l'image du corps du serpent
    this.bodyImage = new Image();
    this.bodyImage.src = "bodySnake.png";

    // Charger l'image de la pomme
    this.appleImage = new Image();
    this.appleImage.src = "apple.png";
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
    // Dessiner la tête du serpent
    this.ctx.drawImage(
      this.headImage,
      this.snake.body[0].x * 30,
      this.snake.body[0].y * 30,
      30,
      30
    );
    // Dessiner le corps du serpent
    for (let i = 1; i < this.snake.body.length; i++) {
      this.ctx.drawImage(
        this.bodyImage,
        this.snake.body[i].x * 30,
        this.snake.body[i].y * 30,
        30,
        30
      );
    }
    // Dessiner l'image de la pomme
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

window.onload = () => {
  const game = new Game();
  game.start();
};