import type {
    Player,
    Team,
    Match,
    Session,
    Schedule,
  } from "./RRDoublesGenerator";

// central design: 
// players entering the next bracket are put into a queue

// 8 players
// first bracket: 12 vs 34 (w), 56 vs 78 (w) -> only this can be generated
// second bracket: 34 vs 78(w), 12 vs 56(w)
// ranking: 78, 34, 56, 12

// 9 players
// single: 8 vs 9(w) -> first thing to do
// first bracket: 12 vs 34 (group as one session with the single) -> random generated excluding 8 and 9

// 10 players
// 2 play-in matches: 7 vs 8 (w) and 9 vs 10 (w) -> randomly generate the play-in matches, and pair the rest up
// first bracket : 8 10 vs 5 6, 12 vs 34

// 11 players
// 3 play-in matches : 6 vs 7, 8 vs 9, 10 vs 11 

// 12 players
// 2 play-in matches : 56 vs 78, 9 10 vs 11 12

// 13 players
