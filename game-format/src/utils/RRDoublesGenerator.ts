import {Player, Match, Team, TournamentState} from "@/types"

// in-place offseting of player list
export function offset(players: Player[]): void {
  if (players.length === 0) {
    console.log("players list empty");
    return;
  }
  const fixedPlayer = players.shift()!;
  const last = players.pop();
  if (last !== undefined && fixedPlayer !== undefined) {
    players.unshift(last);
    players.unshift(fixedPlayer);
  }
}

// generate all matches at the start
export function generateDoubleMatchesFromPlayers(players: Player[]): Match[] {
  const numOfRounds = players.length - 1;
  const allMatches: Match[] = [];
  const workingPlayers = [...players]; // Create a copy to avoid modifying original
  const offsets = players.length % 4;

  for (let i = 0; i < numOfRounds; i++) {
    offset(workingPlayers);
    const validPlayers = offsets === 0 ? [...workingPlayers] : workingPlayers.slice(0, -offsets); // sit out some players
    const newMatches = generateMatchesFromPlayers(validPlayers);
    allMatches.push(...newMatches);
  }

  return allMatches;
}

// turns 12 34 56 78 into 2 matches 
export function generateMatchesFromPlayers(players: Player[]): Match[] {
  if (players.length % 4 !== 0) {
    console.log("invalid number of players");
    return [];
  }

  const queue = [...players];
  const teamList: Team[] = [];

  while (queue.length >= 2) {
    const p1 = queue.shift()!;
    const p2 = queue.shift()!;
    const newTeam: Team = {
      id: `${p1.id} & ${p2.id}`, // Fixed template literal syntax
      type: "pair",
      player1: p1, 
      player2: p2, 
      score: 0
    }
    teamList.push(newTeam);
  }

  const matchList: Match[] = [];
  while (teamList.length >= 2) {
    const t1 = teamList.shift()!;
    const t2 = teamList.shift()!;
    const match: Match = {
      id: `${t1.id} vs ${t2.id}`, 
      type: "double",
      party1: t1, 
      party2: t2, 
      score1: 0, 
      score2: 0
    }
    matchList.push(match);
  }

  return matchList;
}

// get players from one match
export function getPlayers(match: Match): Player[] {
  const playerList = [];
  if (match.type == 'double') {
    const team1 = match.party1 as Team;
    const team2 = match.party2 as Team;
    playerList.push(team1.player1);
    if (team1.player2) playerList.push(team1.player2); // Added null check
    playerList.push(team2.player1);
    if (team2.player2) playerList.push(team2.player2); // Added null check
  } else {
    const player1 = match.party1 as Player;
    const player2 = match.party2 as Player;
    playerList.push(player1);
    if (player2) playerList.push(player2); // Added null check
  }
  return playerList;
}

// get players from multiple matches
export function generatePlayersFromMatches(matches: Match[]): Player[] {
  const allPlayers = [];
  for (let i = 0; i < matches.length; i++) {
    allPlayers.push(...getPlayers(matches[i]));
  } 
  return allPlayers;
}

// generate the next available match from pending match, one that doens't collide with existing matches
// return null if not found
export function findNextAvailMatch(state: TournamentState): Match | null {
  let availMatch = null;

  if (state.currentMatches.length == 0) {
    return state.pendingMatches.length > 0 ? state.pendingMatches[0] : null; // Added length check
  }

  const currentPlayers = generatePlayersFromMatches(state.currentMatches);
  const currPlayerSet = new Set(currentPlayers.map(p => p.id)); // Use player IDs for comparison
  
  for (let i = 0; i < state.pendingMatches.length; i++) {
    const potentialMatch = state.pendingMatches[i];
    const potentialMatchPlayers = getPlayers(potentialMatch);
    let isOverlapping = false;
    // check that all the potentialMatchPlayers are non-overlapping
    for (let j = 0; j < potentialMatchPlayers.length; j++) {
      if (currPlayerSet.has(potentialMatchPlayers[j].id)) { // Compare by ID
        isOverlapping = true;
        break;
      }
    }
    if (isOverlapping == false) {
      availMatch = potentialMatch;
      break; // Found the first available match, break out of loop
    }
  }
  return availMatch;
}

export function initialise(numOfCourts: number, players: Player[]): TournamentState {
  const pendingMatches: Match[] = generateDoubleMatchesFromPlayers(players);
  const allPlayers: Player[] = [...players]; // Use original players, not from matches
  const currentMatches: Match[] = [];

  const initialState: TournamentState = {
    numOfCourts: numOfCourts, 
    pendingMatches: pendingMatches, 
    currentMatches: currentMatches,
    finishedMatches: [],
    participatingPlayers: allPlayers
  }

  // populate current Matches with non-conflicting matches as much as possible
  for (let i = 0; i < numOfCourts; i++) {
    const newMatch = findNextAvailMatch(initialState);
    if (newMatch) {
      newMatch.court = i + 1;
      initialState.currentMatches.push(newMatch);
      // Remove the match from pending matches
      initialState.pendingMatches = initialState.pendingMatches.filter(m => m.id !== newMatch.id);
    }
  }
  
  return initialState;
}

export function advanceMatch(matchToAdvance: Match, state: TournamentState) {
  const matchIndex = state.currentMatches.findIndex(match => match.id === matchToAdvance.id); // Compare by ID
  if (matchIndex === -1) {
    throw new Error('Match not found in current matches');
  }
  
  const currentMatch = matchToAdvance;
  
  // Update and compare scores to determine winner
  if (currentMatch.score1 !== undefined && currentMatch.score2 !== undefined) {
    if (currentMatch.score1 > currentMatch.score2) {
      currentMatch.winner = currentMatch.party1;
    } else if (currentMatch.score2 > currentMatch.score1) {
      currentMatch.winner = currentMatch.party2;
    } else {
      throw new Error('Match cannot end in a tie');
    }
  }

  // having gotten the winner, update the score for each player of the team
  const winningTeam = currentMatch.winner as Team;
  updateScore(winningTeam, state);


  // find a new match to put in the court
  const newMatch = findNextAvailMatch(state);

  // insert the match into the finished match, remove it from current matches
  state.finishedMatches.push(currentMatch);
  state.currentMatches = state.currentMatches.filter(match => match.id !== matchToAdvance.id); // Compare by ID

  // bring the new match to the current match list
  const emptyCourt = currentMatch.court;
  if (newMatch) {
    newMatch.court = emptyCourt;
    state.currentMatches.push(newMatch);
    // Remove the match from pending matches
    state.pendingMatches = state.pendingMatches.filter(m => m.id !== newMatch.id);
  }
}

export function updateScore(winner: Team, state: TournamentState) {
  // for each of the player in the team, find the player from "participatingPlayers"
  const playerIndex1 = state.participatingPlayers!.findIndex(player => player.id === winner.player1.id); // Compare by ID
  if (playerIndex1 !== -1) {
    state.participatingPlayers![playerIndex1].score += 1;
  }
  
  if (winner.player2) { // Check if player2 exists
    const playerIndex2 = state.participatingPlayers!.findIndex(player => player.id === winner.player2!.id); // Compare by ID
    if (playerIndex2 !== -1) {
      state.participatingPlayers![playerIndex2].score += 1;
    }
  }
}