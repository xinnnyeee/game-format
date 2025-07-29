# Game Format

A web application that helps coaches and organizers create and manage different tournament formats with automated match scheduling, court simulation, and score tracking.

## 🏆 Features

- **3 Tournament Formats**: Round Robin, Single Knockout, and King of the Court
- **Automated Match Generation**: Simply input player names and get complete match sequences
- **Court Simulation**: Visual representation of match progress
- **Score Tracking**: Built-in score input fields for easy game management
- **Coach-Friendly Interface**: Simple and intuitive design for quick tournament setup
- **Flexibility**: Support 8-14 players and a customisable number of courts.

## 🎮 Game Formats

### Round Robin

**Purpose**: Perfect for matches that prioritize fair play, ensuring every player competes against every other player.

**Game Rules**:

- Every participant plays against every other participant exactly once
- Generates all possible unique pairings
- Ideal for determining overall rankings and skill assessment
- Best for smaller groups where time allows for complete competition

**Logic**:

- Randomly select one fixed-position player to be fixed at position 1, and the other players rotate 1 position down for every set of matches
- Generate the set of matches by grouping the players into teams, and putting two teams against each other
- For example:

```bash
// first set: 12345678 => 1 & 2 vs 3 & 4, 5 & 6 vs 7 & 8
// second set: 18234567 => 1 & 8 vs 2 & 3, 4 & 5 vs 6 & 7
```

- If the number of players are not multiples of 4, some players will be sat out at each set.
- For example:

```bash
// 9 players: 123456789 => 1 & 2 vs 3 & 4, 5 & 6 vs 7 & 8, player 9 will sit out
// 10 players: 1234567890 => 1 & 2 vs 3 & 4, 5 & 6 vs 7 & 8, player 9 and 0 will sit out
// 11 players: 1234567890A => 1 & 2 vs 3 & 4, 5 & 6 vs 7 & 8, player 9, 0 and A will sit out
// 12 players: 1234567890AB => 1 & 2 vs 3 & 4, 5 & 6 vs 7 & 8, 9 & 0 vs A & B
```

- After all the matches are done, individual player's scores will be added up and used to rank in the game summary.

**Use Cases**:

- Skills assessment tournaments
- League play where fairness is paramount
- Training sessions with comprehensive player evaluation

### Single Knockout

**Purpose**: Elimination-style tournament for quick competition resolution.

**Game Rules**:

- Players are eliminated after losing a single match
- Tournament progresses through elimination rounds until one winner remains
- Bracket-style progression with clear advancement paths

**Logic**:

- If the number of players (N) are not exponents of 2 (e.g. 8, 16, etc), N-A (A being the maximum 2 exponent that is smaller than N) single play-in matches will take place. Winner(s) of these single matches will enter the brackets.
- In the brackets, players are grouped into teams to play double matches. Players stick to the same teaming configuration throughout the whole game.
- At the end, rankings will be decided based on the bracket matches.
- For example, for a bracket with 8 players:

```bash
// First round: A & B (winner) vs C & D, E & F (winner) vs G & H
// Second round: A & B vs E & F (winner), C & D vs G & H (winner)
// Final Ranking:
// #1 - E & F
// #2 - A & B
// #3 - G & H
// #4 - C & D
```

**Use Cases**:

- Championship finals
- Quick tournament resolution
- Large group competitions with limited time

### King of the Court

**Purpose**: Continuous play format where players challenge the reigning "king" of the court.

**Game Rules**:

- One player starts as "king" and defends their position
- Only kings are able to score
- Challengers queue up to play against the current king
- Kings need to win 2 consecutive points to win one score, and challengers need to win 2 consecutive points to replace the king
- Replaced kings and lost challengers go back to the end of the queue
- Continuous rotation ends only when "end game" is clicked or when a timer runs out

**Logics**:

- Initial matches: Let the number of courts be C, and assign C kings among all the teams
- Initial scores: all kings start from -2 score, and the rest start from 0 score
- Put all the non-king teams in the challenger queue, take out C number of teams to play as challenger
- Whenever a match is complete, update the score of king (if king wins), or take a new king from the challenger queue (if challenger wins)
- At the end of the game, rank the teams based on their score

**Use Cases**:

- Practice sessions with continuous play
- Skill development through repeated challenges
- Maintaining high energy and engagement in training

## Using the Web-application

1. Simply go to this link: `https://game-format.vercel.app/`

2. Select any formats below:

- Round Robin
- Single Knockout
- King of the Court
  (Open Play is not available yet.)

3. As prompted, key in the play-to score (the maximum points to play to in a match), players name, and the number of courts available. Click "Enter Game".

4. For each match that happens in the physical court, key in the corresponding match result and click "Complete Match". Make sure that one and only one team reaches the play-to score.

5. Click "End Game" when all the matches are done, and you will be able to see the ranking of teams. Note that if a single-knockout game is incomplete, ranking is unable to be generated accurately.

6. Go back to the landing page by pressing "Home", or click "Game Setup" to restart the game with the same group of players.

## Running the package locally

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/xinnnyeee/game-format.git
cd game-format
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 💻 Usage

1. **Select Format**: Choose from Round Robin, Single Knockout, or King of the Court
2. **Input Players**: Enter all participant names
3. **Generate Matches**: The app automatically creates the match schedule
4. **Track Progress**: Use the court simulation to monitor ongoing matches
5. **Record Scores**: Input match results using the built-in score fields
6. **View Summary**: Access game summaries and final standings

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── pages/
│   ├── Landing.tsx          # Main landing page
│   ├── InputPage.tsx        # Player input page
│   ├── RRGamePage.tsx       # Round Robin game interface
│   ├── SKGamePage.tsx       # Single Knockout game interface
│   ├── KOTCGamePage.tsx     # King of the Court game interface
│   ├── RRGameSummary.tsx    # Round Robin results
│   ├── SKGameSummary.tsx    # Single Knockout results
│   └── KOTCGameSummary.tsx  # King of the Court results
├── components/
│   ├── Court.tsx            # Court simulation component
│   ├── Banner.tsx           # Header/banner component
|   └── Timer.tsx            # Timer for KOTC format
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## 🎯 Roadmap

- [ ] Add more tournament formats (Swiss system, Double elimination)
- [ ] Export results to PDF/Excel
- [ ] Player statistics tracking
- [ ] Tournament history and analytics
- [ ] Mobile app version
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - _Initial work_ - [xinnnyeee](https://github.com/xinnnyeee)

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Designed for coaches and sports organizers
- Inspired by the need for simple tournament management tools

---

**Live Demo**: [https://your-app.vercel.app](https://your-app.vercel.app)

**Repository**: [https://github.com/xinnnyeee/game-format](https://github.com/xinnnyeee/game-format)
