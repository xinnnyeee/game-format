// Types
import type {Player, Team, Match} from '@/types';

export interface TournamentState {
  numOfCourts : number,
  pendingMatches: Match[];
  finishedMatches: Match[];
  currentMatches: Match[]; // Changed from currentMatch to currentMatches array
  participatingPlayers?: Player[];
  participatingTeams?: Team[];
}

/**
 * Calculate how many play-in matches are needed based on the number of players
 */
function calculatePlayInMatches(numPlayers: number): number {
  if (numPlayers <= 8) return 0;
  return numPlayers - 8;
}

/**
 * Generate all the play-in matches with filled players
 */
function generatePlayInMatches(players: Player[]): Match[] {
  const playInMatches: Match[] = [];
  const numPlayIn = calculatePlayInMatches(players.length);
  
  for (let i = 0; i < numPlayIn; i++) {
    const player1 = players[i * 2];
    const player2 = players[i * 2 + 1];
    playInMatches.push({
      id: `${player1.id} vs ${player2.id}`,
      type: 'single',
      party1: players[i * 2],
      party2: players[i * 2 + 1],
      score1: 0,
      score2: 0
    });
  }
  
  return playInMatches;
}

/**
 * Generate bracket 1 matches from available players. This function empties the array of players. 
 */
function generateBracket1Matches(players: Player[]): Match[] {
  const bracketMatches: Match[] = [];

  if (players.length !== 8) {
    console.log("Incorrect number of valid players for bracket generation:", players.length);
    return bracketMatches;
  }
  
  // 2 bracket1 matches are created
  for (let i = 0; i < 2; i++) {
    const team1 = createTeam(players.shift()!, players.shift()!);
    const team2 = createTeam(players.shift()!, players.shift()!);
    bracketMatches.push({
      id: `${team1.id} vs ${team2.id}`,
      type: 'double' as const,
      party1: team1,
      party2: team2,
      score1: 0,
      score2: 0
    });
  }
  
  return bracketMatches;
}

/**
 * Create teams from players
 */
function createTeam(player1: Player, player2: Player): Team {
  return {
    id: `${player1.id} & ${player2.id}`,
    type: "pair",
    rank: 4, // initialised to 4
    player1: player1,
    player2: player2, 
    score: 0
  };
}

/**
 * Check if we can form teams and generate bracket matches
 */
function trygenerateBracket1Matches(state: TournamentState): TournamentState {
  if (!state.participatingPlayers || state.participatingPlayers.length < 8) {
    return state;
  }
  
  // Don't generate if we already have teams
  if (state.participatingTeams && state.participatingTeams.length > 0) {
    return state;
  }
  
  const newState = { ...state };
  
  // Create teams for bracket 1, and add them to participatingPlayers
  const teams: Team[] = [];
  for (let i = 0; i < 4; i++) {
    teams.push(createTeam(
      newState.participatingPlayers![i * 2], 
      newState.participatingPlayers![i * 2 + 1]
    ));
  }
  
  newState.participatingTeams = teams;
  
  // Generate bracket 1 matches
  const bracketMatches = generateBracket1Matches(newState.participatingPlayers!);
  
  // Add teams to the bracket matches
  for (let i = 0; i < bracketMatches.length; i++) {
    bracketMatches[i].party1 = teams[i * 2];
    bracketMatches[i].party2 = teams[i * 2 + 1];
  }
  // push bracket 1 matches to pending matches
  newState.pendingMatches.push(...bracketMatches);
  
  return newState;
}

/**
 * Check if a match can start (both parties are available)
 */
function canMatchStart(match: Match, currentMatches: Match[]): boolean {
  console.log(`Checking if match can start: ${match.party1} vs ${match.party2}`);
  
  if (!match.party1 || !match.party2) {
    console.log('Match missing parties:', { party1: match.party1, party2: match.party2 });
    return false;
  }
  
  console.log('Current matches in progress:', currentMatches.map(m => `${m.party1} vs ${m.party2}`));
  
  // Check if any party is already in a current match
  for (const currentMatch of currentMatches) {
    if (currentMatch.party1 === match.party1 || 
        currentMatch.party1 === match.party2 ||
        currentMatch.party2 === match.party1 || 
        currentMatch.party2 === match.party2) {
      console.log('Direct party conflict found');
      return false;
    }
    
    // For team matches, check individual players
    if (currentMatch.type === 'double' && match.type === 'double') {
      const currentTeam1 = currentMatch.party1 as Team;
      const currentTeam2 = currentMatch.party2 as Team;
      const matchTeam1 = match.party1 as Team;
      const matchTeam2 = match.party2 as Team;
      
      if (currentTeam1 && currentTeam2 && matchTeam1 && matchTeam2) {
        const currentPlayers = [
          currentTeam1.player1.id, currentTeam1.player2!.id,
          currentTeam2.player1.id, currentTeam2.player2!.id
        ];
        const matchPlayers = [
          matchTeam1.player1.id, matchTeam1.player2!.id,
          matchTeam2.player1.id, matchTeam2.player2!.id
        ];
        
        console.log('Current players:', currentPlayers);
        console.log('Match players:', matchPlayers);
        
        // Check if any player is in both matches
        const hasOverlap = currentPlayers.some(player => matchPlayers.includes(player));
        if (hasOverlap) {
          console.log('Player overlap found between matches');
          return false;
        }
      }
    }
  }
  
  console.log('Match can start - no conflicts found');
  return true;
}

/**
 * Initialize matches
 * Input: all players
 * Output: tournament state with pending matches filled with play-in matches, 
 * and participating players pre-entered with byed players
 */
export function initialiseMatches(players: Player[], numOfCourts: number): TournamentState {
  const numPlayers = players.length;
  const numPlayIn = calculatePlayInMatches(numPlayers);
  
  // Generate play-in matches
  const playInMatches = generatePlayInMatches(players);
  
  // Pre-place byed players (players who skip play-in)
  const byedPlayers = players.slice(numPlayIn * 2); // duplicate the list for 8 players
  
  let initialState: TournamentState = {
    numOfCourts: numOfCourts,
    pendingMatches: [...playInMatches],
    finishedMatches: [],
    currentMatches: [],
    participatingPlayers: [...byedPlayers],
    participatingTeams: []
  };
  
  // If we have exactly 8 players, generate bracket matches immediately
  if (numPlayers === 8) {
    initialState = trygenerateBracket1Matches(initialState);
  }
  
  return initialState;
}

/**
 * Start available matches on courts
 * Pre-condition: less than 2 matches currently in progress
 * Input: current tournament state
 * Output: tournament state with matches started on available courts
 */
export function startAvailableMatches(state: TournamentState): TournamentState {
  let newState = { ...state };
  
  // Try to generate bracket matches if we have enough players
  newState = trygenerateBracket1Matches(newState);
  
  const availableCourts = Array.from({ length: state.numOfCourts }, (_, i) => i + 1).filter(court => 
    !newState.currentMatches.some(match => match.court === court)
  );
  
  console.log('Available courts:', availableCourts);
  console.log('Pending matches:', newState.pendingMatches);
  console.log('Current matches:', newState.currentMatches);
  
  // Start matches on available courts
  for (const court of availableCourts) {
    if (newState.pendingMatches.length === 0) {
      console.log('No pending matches, breaking');
      break;
    }
    
    // Find the next available match (one where both parties are defined and no conflicts)
    const nextMatchIndex = newState.pendingMatches.findIndex( // find the index of the match that can start
      (match) => {
        const canStart = canMatchStart(match, newState.currentMatches);
        console.log(`Checking match ${match.party1} vs ${match.party2}:`, {
          party1: match.party1,
          party2: match.party2,
          canStart: canStart
        });
        return canStart;
      }
    );
    
    console.log('Next match index:', nextMatchIndex);
    
    if (nextMatchIndex === -1) {
      console.log('No available matches found, breaking');
      break;
    }
    
    const nextMatch = newState.pendingMatches[nextMatchIndex];
    nextMatch.court = court as 1 | 2;
    
    console.log(`Starting match on court ${court}:`, nextMatch);
    
    // Remove from pending and add to current
    newState.pendingMatches.splice(nextMatchIndex, 1);
    newState.currentMatches.push(nextMatch);
  }
  
  console.log('Final state:', {
    pendingMatches: newState.pendingMatches,
    currentMatches: newState.currentMatches
  });
  
  return newState;
}

/**
 * Advance specific match
 * Pre-condition: match is in currentMatches and has scores
 * Input: current tournament state and match to advance
 * Output: next tournament state with match completed
 */
export function advanceMatch(state: TournamentState, matchToAdvance: Match): TournamentState {
  const matchIndex = state.currentMatches.findIndex(match => match === matchToAdvance);
  if (matchIndex === -1) {
    throw new Error('Match not found in current matches');
  }
  
  const currentMatch = matchToAdvance;
  let newState : TournamentState = {
    ...state
  };
  
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
  
  // Handle single matches: 
  // add the winner to the participating players
  if (currentMatch.type === 'single') {
    const winner = currentMatch.winner as Player;
    
    // Add winner to participating players pool
    if (!newState.participatingPlayers?.includes(winner)) {
      newState.participatingPlayers?.push(winner);
    }
  }
  
  // Handle double matches
  if (currentMatch.type === 'double') {
    const winningTeam = currentMatch.winner as Team;
    if (winningTeam.rank) {
      winningTeam.rank -= 1;
    }
  }
  
  // Move current match to finished matches
  newState.finishedMatches.push(currentMatch);
  
  // Remove from current matches
  newState.currentMatches = newState.currentMatches.filter(match => match !== matchToAdvance);
  
  // Try to generate bracket matches if we now have enough players
  newState = trygenerateBracket1Matches(newState);
  
  // Check if we need to generate bracket 2
  const rankSum = newState.participatingTeams?.reduce((acc, t) => acc + t.rank!, 0);
  if (newState.pendingMatches.length == 0 && rankSum == 14) {
    // Generate bracket 2
    // Sort teamlist by rank (highest rank first for winner/loser bracket)
    newState.participatingTeams?.sort((a, b) => a.rank! - b.rank!);
    
    // Generate two matches (winner match & loser match)    
    const winnerMatch = { 
      id: `${newState.participatingTeams![0].id} vs ${newState.participatingTeams![1].id}`, 
      type: 'double' as const, 
      party1: newState.participatingTeams![0],
      party2: newState.participatingTeams![1],
      score1: 0,
      score2: 0
    }
    // decrease rank for the winnerMatch 
    setWinnerMatchRank(winnerMatch);
    const loserMatch = {
      id: `${newState.participatingTeams![2].id} vs ${newState.participatingTeams![3].id}`,
      type: 'double' as const, 
      party1: newState.participatingTeams![2],
      party2: newState.participatingTeams![3],
      score1: 0,
      score2:0
    }
    // Add bracket 2 matches to pending matches first
    newState.pendingMatches.push(winnerMatch, loserMatch);
      
      // Then immediately start them since all bracket 1 matches are done
      
    }
    newState = startAvailableMatches(newState);
    return newState;
  }
  
  
// reset winner match rank
export function setWinnerMatchRank(match : Match) {
  const team1 : Team = match.party1 as Team;
  const team2 : Team = match.party2 as Team;
  team1.rank = 2;
  team2.rank = 2;
}


/**
 * Get ranking map of teams
 */
export function getRankingMap(teams: Team[]): Map<number, Team> {
  const rankingMap = new Map<number, Team>();
  
  teams.forEach(team => {
    rankingMap.set(team.rank!, team);
  });
  
  return rankingMap;
}

/**
 * Sort teams by rank
 */
export function sortTeamsByRank(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => a.rank! - b.rank!);
}