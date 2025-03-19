let playerX, playerY;
let obstacles = [];
let powerUps = [];
let score = 0;
let speed = 2;
let gameStarted = false;
let gameOver = false;
let gameWon = false;
let lives = 3;
let difficultyLevel = 1;
let powerUpTypes = ['shield', 'extraLife', 'slowDown'];
let playerShielded = false;
let shieldTimer = 0;
let stars = []; // Array to store star positions
let floatingTexts = [];
let particles = []; // Array for particle effects
let maxLevel = 30; // Maximum level to win the game

function setup() {
  createCanvas(400, 400);
  playerX = width / 2;
  playerY = height - 50;
  resetGame();
  
  // Create stars for the background with varying depths
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(150, 255),
      depth: random(3) // 0 = distant, 1 = middle, 2 = close
    });
  }
}

function resetGame() {
  obstacles = [];
  powerUps = [];
  particles = [];
  score = 0;
  speed = 2;
  gameOver = false;
  gameWon = false;
  lives = 3;
  difficultyLevel = 1;
  playerShielded = false;
  shieldTimer = 0;
  
  for (let i = 0; i < 5; i++) {
    spawnObstacle();
  }
}

function draw() {
  // Game background with improved gradient
  let gradientColor1 = color(25, 25, 112); // Midnight blue
  let gradientColor2 = color(0, 0, 50);    // Dark blue
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(gradientColor1, gradientColor2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Draw distant galaxy clusters for deep space effect
  for (let i = 0; i < 5; i++) {
    let x = (width/5) * i + sin(frameCount * 0.001 + i) * 10;
    let y = height/3 + cos(frameCount * 0.002 + i) * 20;
    let size = 40 + sin(frameCount * 0.01 + i) * 5;
    
    noStroke();
    for (let j = 0; j < 20; j++) {
      let angle = j * TWO_PI / 20 + i;
      let starDist = size * 0.8 * random(0.2, 1);
      let starX = x + cos(angle) * starDist;
      let starY = y + sin(angle) * starDist;
      let starSize = random(1, 2);
      
      fill(200, 180, 255, random(50, 100));
      ellipse(starX, starY, starSize, starSize);
    }
  }
  
  // Draw stars with parallax effect
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    
    // Different movement speeds based on star depth for parallax effect
    if (gameStarted && !gameOver) {
      let parallaxSpeed;
      switch(star.depth) {
        case 0: parallaxSpeed = 0.1; break;  // Far stars move slowly
        case 1: parallaxSpeed = 0.3; break;  // Middle stars move at medium speed
        case 2: parallaxSpeed = 0.5; break;  // Close stars move faster
      }
      star.y += parallaxSpeed * speed;
      
      // Wrap stars around when they move off screen
      if (star.y > height) {
        star.y = 0;
        star.x = random(width);
      }
    }
    
    // Make stars twinkle by slightly varying brightness
    let twinkle = sin(frameCount * 0.01 + i * 0.1) * 30;
    let starBrightness = star.brightness + twinkle;
    
    // Larger, brighter stars for close ones
    let starSize = star.size;
    if (star.depth === 2) {
      starSize += 0.5;
      starBrightness = min(starBrightness + 30, 255);
    }
    
    fill(starBrightness);
    noStroke();
    ellipse(star.x, star.y, starSize, starSize);
  }
  
  // Display score, lives, and level progress
  textSize(16);
  fill(255);
  text(`Score: ${score}`, 10, 20);
  text(`Lives: ${lives}`, width - 80, 20);
  
  // Show level with progress to winning
  let levelText = `Level: ${difficultyLevel}/${maxLevel}`;
  text(levelText, width/2 - 40, 20);
  
  if (!gameStarted) {
    displayStartScreen();
    return;
  }
  
  if (gameOver) {
    displayGameOver();
    return;
  }
  
  if (gameWon) {
    displayVictoryScreen();
    return;
  }

  // Draw player
  if (playerShielded) {
    // Draw improved shield effect
    push();
    translate(playerX, playerY);
    // Outer shield glow
    noFill();
    for (let i = 0; i < 3; i++) {
      let alpha = map(i, 0, 3, 100, 20);
      let size = map(i, 0, 3, 35, 45);
      stroke(100, 150, 255, alpha);
      strokeWeight(2 - i * 0.5);
      ellipse(0, 0, size, size);
    }
    
    // Shield ripple effect
    let rippleSize = 35 + sin(frameCount * 0.1) * 5;
    stroke(100, 150, 255, 150);
    strokeWeight(2);
    ellipse(0, 0, rippleSize, rippleSize);
    pop();
    
    shieldTimer--;
    if (shieldTimer <= 0) {
      playerShielded = false;
    }
  }
  
  drawSpaceship(playerX, playerY);
  
  // Handle obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += speed;
    obstacles[i].rotation += obstacles[i].rotationSpeed;
    
    // Draw asteroid
    drawAsteroid(obstacles[i]);

    if (collidesWithAsteroid(playerX, playerY, obstacles[i])) {
      if (playerShielded) {
        // Shield protects from collision
        createExplosion(obstacles[i].x + obstacles[i].size/2, obstacles[i].y + obstacles[i].size/2, color(100, 150, 255));
        obstacles.splice(i, 1);
        spawnObstacle();
        continue;
      }
      
      lives--;
      // Create explosion at collision point
      createExplosion(obstacles[i].x + obstacles[i].size/2, obstacles[i].y + obstacles[i].size/2, color(255, 100, 50));
      obstacles.splice(i, 1);
      spawnObstacle();
      
      if (lives <= 0) {
        // Create a big explosion for game over
        createExplosion(playerX, playerY, color(255, 50, 0), 30);
        gameOver = true;
        return;
      }
      
      continue;
    }

    if (obstacles[i].y > height) {
      obstacles.splice(i, 1);
      score += 1;
      spawnObstacle();
      
      // Increase difficulty every 10 points
      if (score % 10 === 0 && score > 0) {
        speed += 0.5;
        difficultyLevel++;
        
        // Check if player has reached max level to win
        if (difficultyLevel >= maxLevel) {
          gameWon = true;
          // Create celebration particles
          createVictoryCelebration();
          return;
        }
      }
    }
  }
  
  // Handle power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].y += speed * 0.7; // Power-ups move slower than obstacles
    powerUps[i].rotation = (powerUps[i].rotation || 0) + 0.03; // Rotate power-ups
    
    // Draw power-up based on type
    drawPowerUp(powerUps[i]);

    if (collectsPowerUp(playerX, playerY, powerUps[i])) {
      // Apply power-up effect with visual feedback
      try {
        if (powerUps[i].type === 'shield') {
          playerShielded = true;
          shieldTimer = 300; // Shield lasts for 5 seconds (300 frames at 60fps)
          addFloatingText(playerX, playerY, "SHIELD!", color(100, 150, 255));
        } else if (powerUps[i].type === 'extraLife') {
          // Add extra life safely with error handling
          lives = min(lives + 1, 5); // Max 5 lives
          addFloatingText(playerX, playerY, "+1 LIFE", color(255, 100, 100));
        } else if (powerUps[i].type === 'slowDown') {
          speed = max(speed * 0.7, 1); // Slow down, but not below minimum
          addFloatingText(playerX, playerY, "SLOW TIME", color(150, 255, 150));
        }
      } catch(e) {
        // If any error occurs during power-up application, log it but don't freeze the game
        console.log("Power-up error:", e);
      }
      
      // Remove the power-up after collecting it
      powerUps.splice(i, 1);
      continue;
    }

    if (powerUps[i].y > height) {
      powerUps.splice(i, 1);
    }
  }

  // Player movement
  if (keyIsDown(LEFT_ARROW) && playerX > 10) {
    playerX -= 3 + (score > 30 ? 1 : 0); // Speed up player at higher scores
    // Add engine particles when moving
    if (frameCount % 3 === 0) {
      createEngineParticle(playerX + 5, playerY + 10, 1);
    }
  }
  if (keyIsDown(RIGHT_ARROW) && playerX < width - 10) {
    playerX += 3 + (score > 30 ? 1 : 0);
    // Add engine particles when moving
    if (frameCount % 3 === 0) {
      createEngineParticle(playerX - 5, playerY + 10, -1);
    }
  }
  
  // Add engine particles even when not moving (but fewer)
  if (frameCount % 5 === 0) {
    createEngineParticle(playerX, playerY + 10, 0);
  }

  // Randomly spawn power-ups (1% chance per frame)
  if (random(0, 1) < 0.01) {
    spawnPowerUp();
  }

  // Draw floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    try {
      let txt = floatingTexts[i];
      txt.y -= 1;
      txt.alpha -= 255 / txt.life;
      txt.life--;
      
      if (txt.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }
      
      if (txt.color && txt.color.levels && txt.color.levels.length >= 3) {
        fill(txt.color.levels[0], txt.color.levels[1], txt.color.levels[2], txt.alpha);
        textAlign(CENTER);
        textSize(16);
        text(txt.message, txt.x, txt.y);
      }
    } catch(e) {
      // Remove problematic text if there's an error
      console.log("Error rendering floating text:", e);
      floatingTexts.splice(i, 1);
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    p.size *= 0.95;
    
    if (p.life <= 0 || p.size < 0.5) {
      particles.splice(i, 1);
      continue;
    }
    
    fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.life);
    noStroke();
    ellipse(p.x, p.y, p.size, p.size);
  }
}

function heart(x, y, size) {
  // Use a simpler heart shape to avoid potential issues
  push();
  translate(x, y);
  beginShape();
  // Left half of heart
  vertex(0, size * 0.3);
  bezierVertex(-size * 0.5, -size * 0.3, -size, 0, 0, size);
  // Right half of heart
  bezierVertex(size, 0, size * 0.5, -size * 0.3, 0, size * 0.3);
  endShape(CLOSE);
  pop();
}

function spawnObstacle() {
  let x = random(0, width - 30);
  let size = random(20, 50);
  let vertices = random(5, 8);
  let rotation = random(TWO_PI);
  let rotationSpeed = random(-0.05, 0.05);
  
  obstacles.push({
    x: x,
    y: -30,
    size: size,
    vertices: floor(vertices),
    irregularity: random(0.2, 0.5),
    rotation: rotation,
    rotationSpeed: rotationSpeed
  });
}

function spawnPowerUp() {
  let x = random(20, width - 20);
  let type = random(powerUpTypes);
  powerUps.push({
    x: x,
    y: -20,
    type: type,
    rotation: 0,
    pulsePhase: random(TWO_PI)
  });
}

function drawAsteroid(asteroid) {
  push();
  translate(asteroid.x + asteroid.size/2, asteroid.y + asteroid.size/2);
  rotate(asteroid.rotation);
  
  // Draw the asteroid with a cratered texture
  fill(100);
  stroke(70);
  strokeWeight(1);
  beginShape();
  for (let i = 0; i < asteroid.vertices; i++) {
    let angle = map(i, 0, asteroid.vertices, 0, TWO_PI);
    let radius = asteroid.size/2 * (1 - asteroid.irregularity + random(asteroid.irregularity * 2));
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  
  // Draw a few craters
  fill(70);
  noStroke();
  let craters = floor(random(2, 5));
  for (let i = 0; i < craters; i++) {
    let craterX = random(-asteroid.size/3, asteroid.size/3);
    let craterY = random(-asteroid.size/3, asteroid.size/3);
    let craterSize = random(asteroid.size/10, asteroid.size/5);
    ellipse(craterX, craterY, craterSize, craterSize);
  }
  
  pop();
}

function collidesWithAsteroid(px, py, asteroid) {
  // Simple circular collision detection
  let distance = dist(px, py, asteroid.x + asteroid.size/2, asteroid.y + asteroid.size/2);
  return distance < asteroid.size/2 + 10; // 10 is approximately the player's radius
}

function collectsPowerUp(px, py, powerUp) {
  let distance = dist(px, py, powerUp.x, powerUp.y);
  return distance < 15; // Simple distance-based collision
}

function displayStartScreen() {
  // Title animation
  let titleY = height/2 - 60;
  let titleSize = 40 + sin(frameCount * 0.05) * 4;
  let titleGlow = abs(sin(frameCount * 0.02)) * 20;
  
  // Draw title with glow effect
  for (let i = 3; i >= 0; i--) {
    textAlign(CENTER);
    textSize(titleSize - i * 2);
    fill(255, 255, 255, 70 - i * 20);
    text("COSMIC DODGE", width/2, titleY);
  }
  
  textAlign(CENTER);
  textSize(titleSize);
  fill(255, 255, 160);
  text("COSMIC DODGE", width/2, titleY);
  
  // Subtitle
  textSize(18);
  fill(200, 200, 255);
  text("NAVIGATE THE ASTEROID FIELD", width/2, height/2 - 10);
  text(`REACH LEVEL ${maxLevel} TO WIN!`, width/2, height/2 + 15);
  
  // Instructions
  let instructY = height/2 + 50;
  textSize(16);
  fill(180);
  text("Use LEFT/RIGHT arrows to move", width/2, instructY);
  text("Collect power-ups to survive", width/2, instructY + 25);
  
  // Start prompt with blink effect
  if (frameCount % 60 < 40) {
    textSize(20);
    fill(255);
    text("Press SPACE to start", width/2, height/2 + 90);
  }
  
  // Draw a few asteroids in the background for flavor
  for (let i = 0; i < 3; i++) {
    let x = (frameCount * 0.5 + i * 150) % (width + 100) - 50;
    let y = height/4 + i * height/5;
    let size = 20 + i * 10;
    
    push();
    translate(x, y);
    rotate(frameCount * 0.01 + i);
    
    fill(100);
    noStroke();
    beginShape();
    for (let j = 0; j < 6; j++) {
      let angle = j * TWO_PI / 6;
      let radius = size/2 * (0.8 + sin(frameCount * 0.1 + j) * 0.2);
      vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);
    pop();
  }
  
  // Player spaceship at the bottom
  let shipX = width/2 + sin(frameCount * 0.05) * 30;
  drawSpaceship(shipX, height - 80);
  
  if (keyIsPressed && key === ' ') {
    gameStarted = true;
  }
}

function displayGameOver() {
  background(0, 0, 0, 150); // Semi-transparent overlay
  
  // Game Over text with pulse effect
  let gameOverSize = 36 + sin(frameCount * 0.1) * 4;
  textAlign(CENTER);
  textSize(gameOverSize);
  fill(255, 50, 50);
  text("GAME OVER", width/2, height/2 - 40);
  
  // Draw explosion particles around where the ship was
  for (let i = 0; i < 20; i++) {
    let angle = i * TWO_PI / 20 + frameCount * 0.02;
    let distance = 30 + sin(frameCount * 0.1 + i) * 10;
    let x = width/2 + cos(angle) * distance;
    let y = height - 50 + sin(angle) * distance;
    let size = 3 + sin(frameCount * 0.2 + i) * 2;
    
    fill(255, 150 + random(-50, 50), 0, 200);
    noStroke();
    ellipse(x, y, size, size);
  }
  
  // Stats
  textSize(20);
  fill(200);
  text(`Final Score: ${score}`, width/2, height/2 + 10);
  text(`Level Reached: ${difficultyLevel}`, width/2, height/2 + 40);
  
  // Restart prompt with blink effect
  if (frameCount % 60 < 40) {
    textSize(22);
    fill(255);
    text("Press R to restart", width/2, height/2 + 80);
  }
  
  if (keyIsPressed && key === 'r') {
    resetGame();
    gameStarted = true;
  }
}

function displayVictoryScreen() {
  background(0, 0, 0, 150); // Semi-transparent overlay
  
  // Victory text with animation
  let victorySize = 42 + sin(frameCount * 0.1) * 5;
  textAlign(CENTER);
  textSize(victorySize);
  
  // Rainbow color effect for the victory text
  let rainbow = color(
    127 + 127 * sin(frameCount * 0.05),
    127 + 127 * sin(frameCount * 0.05 + TWO_PI/3),
    127 + 127 * sin(frameCount * 0.05 + 2*TWO_PI/3)
  );
  fill(rainbow);
  text("VICTORY!", width/2, height/2 - 40);
  
  // Draw celebration particles around the screen
  for (let i = 0; i < 20; i++) {
    let angle = i * TWO_PI / 20 + frameCount * 0.02;
    let distance = 100 + sin(frameCount * 0.1 + i) * 20;
    let x = width/2 + cos(angle) * distance;
    let y = height/2 + sin(angle) * distance;
    let size = 4 + sin(frameCount * 0.2 + i) * 3;
    
    // Rainbow colored particles
    fill(
      127 + 127 * sin(frameCount * 0.05 + i * 0.5),
      127 + 127 * sin(frameCount * 0.05 + i * 0.5 + TWO_PI/3),
      127 + 127 * sin(frameCount * 0.05 + i * 0.5 + 2*TWO_PI/3),
      200
    );
    noStroke();
    ellipse(x, y, size, size);
  }
  
  // Display final stats
  textSize(22);
  fill(255, 255, 200);
  text("MISSION COMPLETE!", width/2, height/2 + 20);
  
  textSize(18);
  fill(200, 255, 200);
  text(`Final Score: ${score}`, width/2, height/2 + 50);
  text(`You've mastered the Cosmic Dodge!`, width/2, height/2 + 80);
  
  // Restart prompt with blink effect
  if (frameCount % 60 < 40) {
    textSize(20);
    fill(255);
    text("Press R to play again", width/2, height/2 + 120);
  }
  
  if (keyIsPressed && key === 'r') {
    resetGame();
    gameStarted = true;
  }
}

function createVictoryCelebration() {
  // Create lots of colorful particles all around the player
  for (let i = 0; i < 100; i++) {
    let angle = random(TWO_PI);
    let distance = random(20, 100);
    let x = playerX + cos(angle) * distance;
    let y = playerY + sin(angle) * distance;
    
    // Random vibrant colors
    let particleColor = color(
      random(100, 255),
      random(100, 255),
      random(100, 255)
    );
    
    particles.push({
      x: x,
      y: y,
      vx: cos(angle) * random(1, 3),
      vy: sin(angle) * random(1, 3) - 1, // Slight upward bias
      size: random(3, 8),
      color: particleColor,
      life: 255,
      decay: random(1, 3)
    });
  }
}

function keyPressed() {
  // Pause/resume game with P
  if (key === 'p' && gameStarted && !gameOver && !gameWon) {
    if (isLooping()) {
      noLoop();
    } else {
      loop();
    }
  }
  
  // Start game with space
  if (key === ' ' && !gameStarted) {
    gameStarted = true;
  }
  
  // Restart with R when game over or when game is won
  if (key === 'r' && (gameOver || gameWon)) {
    resetGame();
    gameStarted = true;
  }
}

function drawSpaceship(x, y) {
  push();
  translate(x, y);
  
  // Main body
  fill(220, 20, 60); // Crimson red
  beginShape();
  vertex(0, -15); // Nose of the ship
  vertex(-10, 5); // Left wing
  vertex(-5, 10);
  vertex(5, 10);
  vertex(10, 5); // Right wing
  endShape(CLOSE);
  
  // Engine glow
  let glowFlicker = random(0.8, 1);
  fill(255, 165, 0, 200 * glowFlicker); // Orange glow with flicker
  ellipse(-5, 8, 4, 6);
  ellipse(5, 8, 4, 6);
  
  // Cockpit window
  fill(135, 206, 250); // Light blue
  ellipse(0, -2, 6, 8);
  
  // Small details
  stroke(240);
  strokeWeight(0.5);
  line(-7, 0, -12, -3); // Left wing detail
  line(7, 0, 12, -3);  // Right wing detail
  
  noStroke();
  pop();
}

function drawPowerUp(powerUp) {
  push();
  translate(powerUp.x, powerUp.y);
  rotate(powerUp.rotation);
  
  // Pulsing glow effect
  let pulseAmount = sin(frameCount * 0.1 + powerUp.pulsePhase) * 0.2 + 0.8;
  
  if (powerUp.type === 'shield') {
    // Shield power-up (blue)
    // Outer glow
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 3, 0, 50, 150) * pulseAmount;
      fill(100, 150, 255, alpha);
      noStroke();
      ellipse(0, 0, 20 - i * 3, 20 - i * 3);
    }
    
    // Inner shield symbol
    fill(200, 220, 255);
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = i * TWO_PI / 8 - QUARTER_PI;
      let radius = (i % 2 === 0) ? 4 : 8;
      vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);
    
  } else if (powerUp.type === 'extraLife') {
    // Heart power-up (red) - Use a simpler implementation to avoid crashes
    // Outer glow
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 3, 0, 50, 150) * pulseAmount;
      fill(255, 100, 100, alpha);
      noStroke();
      ellipse(0, 0, 20 - i * 3, 20 - i * 3);
    }
    
    // Simplified heart symbol - use a filled circle with a triangle on top
    // instead of the potentially problematic heart function
    fill(255, 60, 60);
    ellipse(0, 2, 10, 10); // Circle for bottom of heart
    triangle(-5, 2, 0, -5, 5, 2); // Triangle for top of heart
    
  } else if (powerUp.type === 'slowDown') {
    // Slow down power-up (green)
    // Outer glow
    for (let i = 3; i > 0; i--) {
      let alpha = map(i, 3, 0, 50, 150) * pulseAmount;
      fill(150, 255, 150, alpha);
      noStroke();
      rect(-10 + i * 1.5, -10 + i * 1.5, 20 - i * 3, 20 - i * 3, 5);
    }
    
    // Clock symbol
    fill(60, 220, 60);
    ellipse(0, 0, 10, 10);
    stroke(30, 130, 30);
    strokeWeight(2);
    line(0, 0, 0, -4);
    line(0, 0, 3, 0);
  }
  
  pop();
}

function addFloatingText(x, y, message, textColor) {
  // Use default values and validate inputs to prevent errors
  const safeX = x || width/2;
  const safeY = y || height/2;
  const safeMessage = message || "";
  const safeColor = textColor || color(255);
  
  try {
    floatingTexts.push({
      x: safeX,
      y: safeY,
      message: safeMessage,
      color: safeColor,
      alpha: 255,
      life: 60 // Text will live for 60 frames (1 second)
    });
  } catch(e) {
    console.log("Error adding floating text:", e);
  }
}

function createExplosion(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 3);
    particles.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(3, 8),
      color: color,
      life: 255,
      decay: random(3, 8)
    });
  }
}

function createEngineParticle(x, y, direction) {
  // Base color variations for engine flame
  let r = random(200, 255);
  let g = random(100, 200);
  let b = random(0, 100);
  
  // Create main engine flame
  particles.push({
    x: x,
    y: y,
    vx: random(-0.5, 0.5) + direction * 0.5,
    vy: random(1, 3),
    size: random(2, 5),
    color: color(r, g, b),
    life: 100,
    decay: random(3, 8)
  });
  
  // Sometimes add a smoke particle
  if (random() > 0.7) {
    particles.push({
      x: x,
      y: y + random(5, 10),
      vx: random(-0.3, 0.3) + direction * 0.2,
      vy: random(0.2, 0.8),
      size: random(2, 4),
      color: color(150, 150, 150),
      life: 60,
      decay: random(2, 4)
    });
  }
}
