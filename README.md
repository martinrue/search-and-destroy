# Search & Destroy

Search & Destroy is a coding game in which you must find and destroy your opponent on a 2D grid. The game is played by implementing two http-based bots that play turn-by-turn against each other. Bots can move, lay mines and run radar scans.

## Running

Bring up two bots on their respective ports:

```
  node demo-bot-1/server.js 1001
  node demo-bot-2/server.js 1002
```

Run a game by specifying where the bots are and how long to wait between each round:

```
  node game/runner.js http://localhost:1001 http://localhost:1002 1000
```

The game will render each frame in the terminal until a winner is found:

```
 _______                         __        __     _____               __
|     __|.-----.---.-.----.----.|  |--.  _|  |_  |     \.-----.-----.|  |_.----.-----.--.--.
|__     ||  -__|  _  |   _|  __||     | |_    _| |  --  |  -__|__ --||   _|   _|  _  |  |  |
|_______||_____|___._|__| |____||__|__|   |__|   |_____/|_____|_____||____|__| |_____|___  |
                                                                                     |_____|
┌─────────────────────┐
│ Turn: 1             │
├─────────────────────┤
│ X . . . . . . . . X │
│ . . . . . . . . . . │
│ . . . . . . . . . . │
│ . . . . . . . . . . │
│ . . . . . . . . . . │
│ . . . . . . . . . . │
│ . . 1 . . . . 2 . . │
│ . . . . . . . . . . │
│ . . . . . . . . . . │
│ X . . . . . . . . X │
└─────────────────────┘

  0: player 1 initialised at 2,6
  0: player 2 initialised at 7,6

players ready – hit enter to start...
```

## Rules

When a bot's `/turn` endpoint is requested, a turn response must be returned. There are three possible turns that can be played.

### Turns

#### `{ action: "MOVE", x, y }`

Moves to cell `x,y` on the grid.

#### `{ action: "LAYMINE", x, y }`

Lays a mine at cell `x,y` on the grid.

#### `{ action: "RUNRADAR" }`

Requests the current state of the grid. The bot's `/radar` endpoint will be called with the current grid. The opponent will be notified on their turn that a radar was used.

See the demo bot for a full example.
