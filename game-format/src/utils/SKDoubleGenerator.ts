import { CookieSignatureOptions } from "react-router-dom";
export interface TournamentState {
  currentRound: number;
  pendingMatches: Match[];
  completedMatches: Match[];
  advancingPlayers?: Player[];
  advancingTeams?: Team[];
}

export interface BaseMatch {
  id: string
}

// logic for deciding the fields of each type: leaderboard
// two leaderboards: individual and team
// individual: includes everyone, based on the individual scores ever got
// team: includes only those made it past round 0, based on the algorithm
export type Player = {id: string, name: string, score: number};
export type Team = {id: string, player1: Player, player2: Player};
export interface SingleMatch extends BaseMatch {
  type: 'single';
  player1: Player;
  player2: Player;
  winner?: Player;
}

export interface DoubleMatch extends BaseMatch {
  type: 'double';
  team1: Team;
  team2: Team;
  winner?: Team;
}
type Match = SingleMatch | DoubleMatch; 

// only needed to run for (numOfPlayers !== 8)
// input: all players
// output: Teams going
export function generateRound0Matches(players : Player[]) : TournamentState {
  // round 0 :
  // randomise the queue
  const randomPlayers : Player[] = [...players].sort(() => Math.random() - 0.5);
  // generate number of play-ins
  const playInMatch : number = players.length % 8;
  const matchQueue : SingleMatch[] = [];
  for (let i = 0; i < playInMatch; i++) {
    // create one single match involving any two random players
    const p1 : Player = randomPlayers.shift()!;
    const p2 : Player = randomPlayers.shift()!;
    const singleMatch : SingleMatch = {id: `r0-m${i}`, type: 'single', player1: p1, player2: p2, winner: undefined};
    // put the single match in a match queue
    matchQueue.push(singleMatch);
  }
  // put the leftover players into the queue for round1
  const round1Players : Player[] = [...randomPlayers];
  const round0 : TournamentState = {currentRound: 0, pendingMatches: matchQueue, completedMatches: [], advancingPlayers: round1Players}; 
  return round0;
}

// input: assume that advanced players/teams are already even in number
// after each round, run this to generate the next round
export function advanceTournament(currentState : TournamentState) : TournamentState {
  // read the winners from existing round's matches
  if (currentState.advancingPlayers) { 
    // convert the players into teams
    const currentTeams : Team[] = pairPlayersUp(currentState.advancingPlayers);
  } if (currentState.advancingTeams) {
    const currentTeams : Team[] = currentState.advancingTeams;
    }

  // add them to the advancing players
  // generate new matches based on advancing players/teams (doubles, convert to team)
}

export function pairPlayersUp(players : Player[]) : Team[] {
  const teamList : Team[] = [];
  if (!players) {
    console.log(`no players to pair up`);
    return [];
  } 
  if (players.length % 2 !== 0) {
    console.log(`players number is odd, cannot pair up`);
    return [];
  }
  while (players.length >= 2) {
    const p1 : Player = players.shift()!;
    const p2 : Player = players.shift()!;
    const newTeam : Team = {id: `team-${p1.name}-${p2.name}`, player1: p1, player2: p2};
    teamList.push(newTeam);
  }
  return teamList;
}
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
