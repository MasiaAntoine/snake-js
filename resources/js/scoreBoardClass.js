export class ScoreBoard {
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
