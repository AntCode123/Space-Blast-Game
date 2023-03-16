class Game {
  constructor() {
    this.width = 1000;
    this.height = 1000;
    this.drag = 0.991;
    this.score = 0;
    this.enemies = [];
    this.enemyParticles = [];
    this.numberOfEnemies = 8;
    this.borders = [];
    this.enemySenseRange = 140;
    this.shakeTicks = 0;
    this.shakeDx = 0;
    this.shakeDy = 0;
    this.over = false;
  }
  DynamicObjectHandler() {
    this.handleBorders();
    player.handle();
    player.handleMissile();
    player.handleParticles();
    this.handleEnemies();
    this.handleEnemyParticles();
    this.shakeScreen();
  }
  StaticObjectHandler() {
    player.displayHealth();
    radar.display();
    back.display();
    this.displayText();
    screen.display();
  }
  distanceBetween(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
  createBorders() {
    this.borders.push(
      new Border(
        windowWidth / 2 - game.width / 2,
        windowHeight / 2 - game.height / 2,
        game.width,
        0
      )
    );
    this.borders.push(
      new Border(
        windowWidth / 2 - game.width / 2,
        windowHeight / 2 + game.height / 2,
        game.width,
        0
      )
    );
    this.borders.push(
      new Border(
        windowWidth / 2 - game.width / 2,
        windowHeight / 2 - game.height / 2,
        0,
        game.height
      )
    );
    this.borders.push(
      new Border(
        windowWidth / 2 + game.width / 2,
        windowHeight / 2 - game.height / 2,
        0,
        game.height
      )
    );
  }
  handleBorders() {
    for (let i = 0; i < 4; i++) {
      this.borders[i].display();
      this.borders[i].move();
    }
  }
  createEnemies() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemies.push(
        new Enemy(
          random(this.borders[2].x, this.borders[2].x + this.width),
          random(this.borders[0].y, this.borders[0].y + this.height),
          random(0, 360),
          15,
          [0, 200, 0]
        )
      );
    }
  }
  handleEnemies() {
    this.displayEnemies();
    this.moveEnemies();
    this.enemyBorderCollision();
    this.enemyEnemyCollision();
  }
  enemySpawn(enemy) {
    enemy.x = random(this.borders[2].x, this.borders[2].x + this.width);
    enemy.y = random(this.borders[0].y, this.borders[0].y + this.height);
  }
  displayEnemies() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemies[i].display();
    }
  }
  moveEnemies() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemies[i].move();
    }
  }
  enemyBorderCollision() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      if (this.enemies[i].x - this.enemies[i].size < this.borders[2].x) {
        this.enemies[i].angle *= -1 + 90;
        this.enemies[i].x = this.borders[2].x + this.enemies[i].size;
      } else if (this.enemies[i].x + this.enemies[i].size > this.borders[3].x) {
        this.enemies[i].angle *= -1 + 90;
        this.enemies[i].x = this.borders[3].x - this.enemies[i].size;
      } else if (this.enemies[i].y - this.enemies[i].size < this.borders[0].y) {
        this.enemies[i].angle *= -1;
        this.enemies[i].y = this.borders[0].y + this.enemies[i].size;
      } else if (this.enemies[i].y + this.enemies[i].size > this.borders[1].y) {
        this.enemies[i].angle *= -1;
        this.enemies[i].y = this.borders[1].y - this.enemies[i].size;
      }
    }
  }
  enemyEnemyCollision() {
    for (let i = 0; i < this.enemies.length - 1; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        if (
          this.distanceBetween(
            this.enemies[i].x,
            this.enemies[i].y,
            this.enemies[j].x,
            this.enemies[j].y
          ) <= 30
        ) {
          let tempAngle = this.enemies[i].angle;
          this.enemies[i].angle = this.enemies[j].angle;
          this.enemies[j].angle = tempAngle;
        }
      }
    }
  }
  handleEnemyParticles() {
    for (let i = 0; i < this.enemyParticles.length; i++) {
      this.enemyParticles[i].display();
      this.enemyParticles[i].move(this.enemyParticles, "enemy");
    }
  }
  shakeScreen() {
    if (this.shake) {
      if (this.shakeTicks < 15) {
        let index = round(random(0, 1), 0);
        let dir = [-1, 1];
        this.shakeDx = random(2, 4) * dir[index];
        this.shakeDy = random(2, 4) * dir[index];
        this.shakeTicks++;
      } else {
        this.shake = false;
        this.shakeTicks = 0;
        this.shakeDx = 0;
        this.shakeDy = 0;
      }
    }
  }
  displayText() {
    fill(255);
    textFont("sans-serif");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(60);
    text("SPACE BLAST", windowWidth / 2, 60);
    text(this.score, windowWidth / 2, screen.y + 40);
  }
}

class Screen {
  constructor() {
    this.width = 800;
    this.height = 500;
    this.color = [255, 255, 255, 0];
    this.x = windowWidth / 2 - this.width / 2;
    this.y = windowHeight / 2 - this.height / 2;
  }
  display() {
    stroke(255);
    strokeWeight(5);
    fill(this.color);
    rect(this.x, this.y, this.width, this.height, 8);
  }
}

class Player {
  constructor() {
    this.x = windowWidth / 2;
    this.y = windowHeight / 2;
    this.dx = 0;
    this.dy = 0;
    this.size = 15;
    this.angle = 0;
    this.health = 100;
    this.particles = [];
    this.missile = null;
  }
  handle() {
    this.display();
    this.accelerate();
    this.applyDrag();
    this.rotate();
    this.borderCollision();
    this.enemyCollision();
    this.missileEnemyCollision();
  }
  handleMissile() {
    if (this.missile != null) {
      this.missile.display();
      this.missile.move();
    }
  }
  handleParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].display();
      this.particles[i].move(this.particles, "player");
    }
  }
  display() {
    fill(255, 255, 255, 0);
    stroke(255);
    strokeWeight(5);
    let x1 = this.x + cos(this.angle) * this.size;
    let y1 = this.y - sin(this.angle) * this.size;
    let x2 = this.x + cos(this.angle - 135) * this.size;
    let y2 = this.y - sin(this.angle - 135) * this.size;
    let x3 = this.x + cos(this.angle + 135) * this.size;
    let y3 = this.y - sin(this.angle + 135) * this.size;
    triangle(x1, y1, x2, y2, x3, y3);
  }
  accelerate() {
    if (keyIsDown(87)) {
      if (Math.sqrt(this.dx * this.dx + this.dy * this.dy) < 4) {
        this.dx += cos(this.angle) / 15;
        this.dy -= sin(this.angle) / 15;
      }
      this.particles.push(
        new Particle(
          this.x + cos(this.angle - 180) * this.size,
          this.y - sin(this.angle - 180) * this.size,
          random(1, 2),
          random(3, 7),
          random(this.angle + 160, this.angle + 200),
          20,
          [255, int(random(0, 255)), 0]
        )
      );
    }
  }
  applyDrag() {
    this.dx *= game.drag;
    this.dy *= game.drag;
  }
  rotate() {
    if (keyIsDown(65)) {
      this.angle += 3;
    } else if (keyIsDown(68)) {
      this.angle -= 3;
    }
  }
  displayHealth() {
    noStroke();
    if (this.health == 100) {
      fill(0, 255, 0);
      rect(this.x - 20, this.y - 30, 40, 5);
    } else if (this.health == 80) {
      fill(0, 255, 0);
      rect(this.x - 20, this.y - 30, 32, 5);
    } else if (this.health == 60) {
      fill(255, 255, 0);
      rect(this.x - 20, this.y - 30, 24, 5);
    } else if (this.health == 40) {
      fill(255, 125, 0);
      rect(this.x - 20, this.y - 30, 16, 5);
    } else if (this.health == 20) {
      fill(255, 0, 0);
      rect(this.x - 20, this.y - 30, 8, 5);
    } else {
      game.over = true;
    }
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(this.x - 20, this.y - 30, 40, 5, 5);
  }
  fire() {
    if (this.missile == null) {
      game.fireSFX.play();
      this.missile = new Missile(
        this.x + cos(this.angle) * (this.size + 3),
        this.y - sin(this.angle) * (this.size + 3),
        this.angle,
        9,
        7,
        [255, 255, 0],
        0,
        50
      );
    }
  }
  enemyCollision() {
    for (let i = 0; i < game.enemies.length; i++) {
      if (
        game.distanceBetween(
          this.x,
          this.y,
          game.enemies[i].x,
          game.enemies[i].y
        ) < 20
      ) {
        for (let j = 0; j < 20; j++) {
          game.enemyParticles.push(
            new Particle(
              game.enemies[i].x,
              game.enemies[i].y,
              random(0.7, 3.5),
              random(2, 7),
              random(0, 360),
              random(15, 26),
              [0, 200, 0]
            )
          );
        }
        game.explosionSFX.play()
        this.health -= 20;
        game.enemySpawn(game.enemies[i]);
        game.shake = true;
        break;
      }
    }
  }
  missileEnemyCollision() {
    if (this.missile != null) {
      for (let i = 0; i < game.enemies.length; i++) {
        if (
          game.distanceBetween(
            this.missile.x,
            this.missile.y,
            game.enemies[i].x,
            game.enemies[i].y
          ) < 20
        ) {
          for (let j = 0; j < 20; j++) {
            game.enemyParticles.push(
              new Particle(
                game.enemies[i].x,
                game.enemies[i].y,
                random(0.7, 3.5),
                random(2, 7),
                random(0, 360),
                random(15, 26),
                [0, 200, 0]
              )
            );
          }
          game.explosionSFX.play();
          game.score++;
          game.enemySpawn(game.enemies[i]);
          game.shake = true;
          this.missile = null;
          break;
        }
      }
    }
  }
  borderCollision() {
    if (game.borders[2].x > this.x - this.size) {
      game.borders[2].x = this.x - this.size;
      this.dx *= -1;
    } else if (game.borders[3].x < this.x + this.size) {
      game.borders[3].x = this.x + this.size;
      this.dx *= -1;
    } else if (game.borders[0].y > this.y - this.size) {
      game.borders[0].y = this.y - this.size;
      this.dy *= -1;
    } else if (game.borders[1].y < this.y + this.size) {
      game.borders[1].y = this.y + this.size;
      this.dy *= -1;
    }
  }
}

class Missile {
  constructor(x, y, angle, speed, size, color, ticks, range) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.angle = angle;
    this.speed = speed;
    this.size = size;
    this.color = color;
    this.ticks = ticks;
    this.range = range;
  }
  display() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.size);
  }
  move() {
    if (this.ticks < this.range) {
      this.dx = cos(this.angle) * this.speed;
      this.dy = -sin(this.angle) * this.speed;
      this.x += this.dx - player.dx;
      this.y += this.dy - player.dy;
      this.ticks++;
    } else {
      player.missile = null;
    }
  }
}

class Enemy {
  constructor(x, y, angle, size, color) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.color = color;
    this.size = size;
    this.angle = angle;
  }
  display() {
    fill(this.color);
    stroke(255);
    strokeWeight(3);
    let x1 = this.x + cos(this.angle) * this.size;
    let y1 = this.y - sin(this.angle) * this.size;
    let x2 = this.x + cos(this.angle - 120) * this.size;
    let y2 = this.y - sin(this.angle - 120) * this.size;
    let x3 = this.x + cos(this.angle + 120) * this.size;
    let y3 = this.y - sin(this.angle + 120) * this.size;
    triangle(x1, y1, x2, y2, x3, y3);
  }
  move() {
    if (
      game.distanceBetween(player.x, player.y, this.x, this.y) <
      game.enemySenseRange
    ) {
      let adj = player.x - this.x;
      let opp = this.y - player.y;
      this.angle = atan2(opp, adj);
    }
    this.dx = cos(this.angle);
    this.dy = -sin(this.angle);
    this.x += this.dx - player.dx - game.shakeDx;
    this.y += this.dy - player.dy - game.shakeDy;
  }
  fire() {}
}
class Radar {
  constructor(x, y, radius, color) {
    this.radius = radius;
    this.color = color;
    this.x = x - this.radius;
    this.y = y + this.radius;
  }
  display() {
    this.displayLines();
    this.displayCircles();
    this.displayPlayer();
    this.displayEnemies();
  }
  displayLines() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
    stroke(0, 200, 0);
    strokeWeight(2);
    let angle = 0;
    for (let i = 0; i < 10; i++) {
      line(
        this.x,
        this.y,
        this.x + cos(angle) * this.radius,
        this.y - sin(angle) * this.radius
      );
      angle += 360 / 10;
    }
  }
  displayCircles() {
    fill(255, 255, 255, 0);
    stroke(0, 200, 0);
    strokeWeight(2);
    for (let i = 1; i < 6; i++) {
      circle(this.x, this.y, ((this.radius * 2) / 6) * i);
    }
  }
  displayPlayer() {
    fill(0, 200, 0);
    stroke(255);
    strokeWeight(2);
    let x1 = this.x + cos(player.angle) * 7;
    let y1 = this.y - sin(player.angle) * 7;
    let x2 = this.x + cos(player.angle - 135) * 7;
    let y2 = this.y - sin(player.angle - 135) * 7;
    let x3 = this.x + cos(player.angle + 135) * 7;
    let y3 = this.y - sin(player.angle + 135) * 7;
    triangle(x1, y1, x2, y2, x3, y3);
  }
  displayEnemies() {
    noStroke();
    fill(0, 200, 0);
    for (let i = 0; i < game.enemies.length; i++) {
      let x = this.x + (game.enemies[i].x - player.x) / 5;
      let y = this.y + (game.enemies[i].y - player.y) / 5;
      if (game.distanceBetween(x, y, this.x, this.y) < this.radius) {
        circle(x, y, 10);
      }
    }
    stroke(255);
    strokeWeight(5);
    fill(255, 255, 255, 0);
    circle(this.x, this.y, this.radius * 2);
  }
}

class Background {
  constructor() {
    this.color = [20, 20, 40];
  }
  display() {
    noStroke();
    fill(this.color);
    rect(0, 0, windowWidth / 2 - screen.width / 2, windowHeight);
    rect(
      windowWidth / 2 + screen.width / 2,
      0,
      windowWidth / 2 - screen.width / 2,
      windowHeight
    );
    rect(0, 0, windowWidth, windowHeight / 2 - screen.height / 2);
    rect(
      0,
      windowHeight / 2 + screen.height / 2,
      windowWidth,
      windowHeight / 2 - screen.height / 2
    );
  }
}

class Border {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  display() {
    line(this.x + this.width, this.y + this.height, this.x, this.y);
  }
  move() {
    this.x -= player.dx - game.shakeDx;
    this.y -= player.dy - game.shakeDy;
  }
}

class Particle {
  constructor(x, y, speed, diameter, angle, duration, color) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.diameter = diameter;
    this.angle = angle;
    this.duration = duration;
    this.color = color;
    this.ticks = 0;
  }
  display() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.diameter);
  }
  move(particles, type) {
    if (this.ticks < this.duration) {
      this.dx = cos(this.angle) * this.speed;
      this.dy = -sin(this.angle) * this.speed;
      if (type == "player") {
        this.x += this.dx;
        this.y += this.dy;
      } else {
        this.x += this.dx - player.dx - game.shakeDx;
        this.y += this.dy - player.dy - game.shakeDy;
      }
      this.ticks++;
    } else {
      particles.splice(particles.indexOf(this), 1);
    }
  }
}

function setup() {
  game = new Game();
  screen = new Screen();
  back = new Background();
  radar = new Radar(screen.x + screen.width - 10, screen.y + 10, 100, [
    30,
    30,
    55,
  ]);
  player = new Player();

  game.createBorders();
  game.createEnemies();

  game.explosionSFX = loadSound("explosion.wav");
  game.fireSFX = loadSound("blast.wav");

  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (keyCode == 32) {
    player.fire();
  }
}

function draw() {
  background([30, 30, 55]);
  if (!game.over) {
    game.DynamicObjectHandler();
    game.StaticObjectHandler();
  } else {
    textSize(100);
    text("GAME OVER!", windowWidth / 2, windowHeight / 2);
  }
}