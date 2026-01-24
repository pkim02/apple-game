# 사과 게임 (Apple Game) 🍎

A web-based puzzle game where you select apples whose numbers sum to exactly 10.

## How to Play

1. Click the **게임 시작** (Start Game) button
2. Click and drag to create a rectangular selection box over the apples
3. If the sum of the numbers in your selection equals exactly **10**, the apples disappear and you earn points!
4. Apples will fall down to fill gaps, and new apples appear at the top
5. Try to score as many points as possible before the 2-minute timer runs out!

## Game Rules

- **Grid**: 17 columns × 10 rows of apples
- **Numbers**: Each apple displays a random number from 1 to 9
- **Goal**: Select apples that sum to exactly 10
- **Timer**: 2 minutes per game
- **Scoring**: 
  - Base: 10 points per apple removed
  - Bonus: +5 points for each apple beyond 2 in a single selection

## Features

- Modern, clean UI with Tailwind CSS
- Smooth animations for apple removal and falling
- Visual feedback for valid/invalid selections
- Responsive design for mobile and desktop
- High score tracking with localStorage
- Touch support for mobile devices

## Tech Stack

- HTML5
- CSS3 with Tailwind CSS
- Vanilla JavaScript

## Running the Game

Simply open `index.html` in a web browser. No build process or server required!

```bash
# Or use a local server for best results:
npx serve .
# or
python -m http.server 8000
```

## Files

- `index.html` - Main HTML structure with Tailwind CDN
- `style.css` - Custom animations and styling
- `game.js` - Game logic and mechanics

## License

MIT License - Feel free to use and modify!
