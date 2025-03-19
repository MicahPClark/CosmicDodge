# Space Dodge

A fast-paced space-themed arcade game where you pilot a spaceship through a dangerous asteroid field, collect power-ups, and try to reach level 30 to win!

![Cosmic Dodge Game](https://i.imgur.com/7CLHnrD.png)

## 🎮 Play the Game

You can play Cosmic Dodge by opening `index.html` in any modern web browser.

## 🚀 Game Overview

In Cosmic Dodge, you control a spaceship navigating through an ever-increasing field of asteroids. Your mission is to survive long enough to reach level 30 while avoiding collisions and collecting helpful power-ups along the way.

The game features:
- Beautiful space-themed visuals with parallax star backgrounds
- Increasing difficulty as you progress
- Various power-ups to help your journey
- A clear winning objective

## 🕹️ Controls

- **LEFT/RIGHT Arrow Keys**: Move your spaceship
- **SPACE**: Start the game from the title screen
- **P**: Pause/resume the game
- **R**: Restart after game over or victory

## ✨ Features

### Visuals
- Detailed animated starry background with parallax effect
- Dynamic asteroid designs with rotation and craters
- Engine particles and explosion effects
- Beautifully animated shield and power-up effects

### Gameplay
- Three lives to start with
- Multiple power-ups to collect:
  - 🛡️ **Shield**: Protects from one collision
  - ❤️ **Extra Life**: Gives you an additional life (max 5)
  - ⏱️ **Slow Down**: Temporarily reduces the game speed
- 30 increasing difficulty levels
- Score tracking based on obstacles avoided

### Game States
- Attractive animated start screen
- Pause functionality
- Game over screen with stats
- Victory celebration when you reach level 30

## 🛠️ Technical Details

The game is built using:
- HTML5
- CSS
- JavaScript
- p5.js library for rendering

## 💻 Development

### Project Structure
- `index.html` - Main HTML file
- `sketch.js` - All game logic and rendering
- `README.md` - Documentation

### How to Modify
The game is highly customizable. Here are some variables you can adjust in `sketch.js`:

- `maxLevel`: Change how many levels are needed to win
- `powerUpTypes`: Add or modify available power-ups
- `speed`: Adjust the initial game speed
- Various particle and visual effect parameters

## 🔧 Setup for Development

1. Clone the repository:
```
git clone https://github.com/yourusername/cosmic-dodge.git
```

2. Open the project in your favorite code editor

3. To run the game locally, open `index.html` in a web browser or use a local server:
```
# If you have Python installed:
python -m http.server
```

4. Visit `localhost:8000` in your browser

## 🙏 Credits

- Game design and programming: [Micah Clark]
- Built with [p5.js](https://p5js.org/)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Feel free to contribute to this project by submitting issues or pull requests! 
