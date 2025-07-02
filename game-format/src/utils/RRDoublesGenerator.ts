export type Player = {
  score: number;
  name: string;
};

export type Team = [Player, Player];
export type Match = {id : string, team1: Team, team2: Team, score1: number, score2: number};
export type Session = [Match, Match];
export type Schedule = Session[];

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

export function generateMatchesPerRound(numOfPlayers: number): number {
  if (numOfPlayers >= 8 && numOfPlayers <= 14) {
    return Math.floor(numOfPlayers / 4);
  } else {
    return -1;
  }
}

export function generateRRMatches(players: Player[]): Schedule {
  if (players.length < 8 || players.length > 14) {
    console.log("Invalid number of players, must be kept between 8 and 14");
    return [];
  }
  return generateDoubleMatchesFromPlayers(players);
}

export function generateDoubleMatchesFromPlayers(players: Player[]): Schedule {
  const numOfRounds = players.length - 1;
  const allMatches: Match[] = [];
  const numOfMatchesPerRound = generateMatchesPerRound(players.length);
  const offsets = players.length % 4;

  for (let i = 0; i < numOfRounds; i++) {
    offset(players);
    const validPlayers = offsets === 0 ? [...players] : players.slice(0, -offsets); // sit out some players
    const newMatches = generateMatchesFromPlayers(validPlayers);
    allMatches.push(...newMatches);
  }

  return generateSessionsFromMatches(allMatches, numOfMatchesPerRound);
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
    teamList.push([p1, p2]);
  }

  const matchList: Match[] = [];
  while (teamList.length >= 2) {
    const t1 = teamList.shift()!;
    const t2 = teamList.shift()!;
    const match : Match = {
      id:crypto.randomUUID(), 
      team1: t1, 
      team2: t2, 
      score1: 0, 
      score2: 0
    }
    matchList.push(match);
  }

  return matchList;
}

export function generateSessionsFromMatches(matches: Match[], numOfMatchesPerRound: number): Session[] {
  const sessList: Session[] = [];
  const dummyPlayer: Player = { name: "BYE", score: 0 };
  const dummyMatch: Match = {id: crypto.randomUUID(), team1: [dummyPlayer, dummyPlayer], team2: [dummyPlayer, dummyPlayer], score1: 0, score2: 0};

  if (numOfMatchesPerRound === 2) {
    while (matches.length >= 2) {
      const sess: Session = [matches.shift()!, matches.shift()!];
      sessList.push(sess);
    }
    if (matches.length === 1) {
      sessList.push([matches.pop()!, dummyMatch]);
    }
  } else if (numOfMatchesPerRound === 3) {
    let j = 0;
    while (j + 6 <= matches.length) {
      sessList.push([matches[j], matches[j + 1]]);
      sessList.push([matches[j + 2], matches[j + 4]]);
      sessList.push([matches[j + 3], matches[j + 5]]);
      j += 6;
    }
    if (matches.length - j === 3) {
      sessList.push([matches[j], matches[j + 1]]);
      sessList.push([matches[j + 2], dummyMatch]);
    }
  }

  return sessList;
}

// FIXED VERSION - Properly handles player deduplication and score accumulation
export function tallyMatchScore(games: Schedule): Player[] {
  // Use a Map to track unique players and their accumulated match scores
  const playerMatchScores = new Map<string, number>();
  
  // First, accumulate all match scores for each player
  for (let i = 0; i < games.length; i++) {
    const session = games[i];
    for (let j = 0; j < session.length; j++) {
      const match: Match = session[j];
      
      // Skip BYE matches
      if (match.team1[0].name === "BYE" || match.team2[0].name === "BYE") {
        continue;
      }
      
      // Add match scores for team1 players
      match.team1.forEach(player => {
        const currentScore = playerMatchScores.get(player.name) || 0;
        playerMatchScores.set(player.name, currentScore + match.score1);
      });
      
      // Add match scores for team2 players
      match.team2.forEach(player => {
        const currentScore = playerMatchScores.get(player.name) || 0;
        playerMatchScores.set(player.name, currentScore + match.score2);
      });
    }
  }
  
  // Create a set of unique players from the first occurrence in matches
  const uniquePlayers = new Map<string, Player>();
  
  for (let i = 0; i < games.length; i++) {
    const session = games[i];
    for (let j = 0; j < session.length; j++) {
      const match: Match = session[j];
      
      // Skip BYE matches
      if (match.team1[0].name === "BYE" || match.team2[0].name === "BYE") {
        continue;
      }
      
      // Collect unique players (using first occurrence)
      match.team1.forEach(player => {
        if (!uniquePlayers.has(player.name)) {
          uniquePlayers.set(player.name, { ...player });
        }
      });
      
      match.team2.forEach(player => {
        if (!uniquePlayers.has(player.name)) {
          uniquePlayers.set(player.name, { ...player });
        }
      });
    }
  }
  
  // Create final player list with accumulated scores
  const finalPlayerList: Player[] = Array.from(uniquePlayers.values()).map(player => ({
    name: player.name,
    score: (player.score || 0) + (playerMatchScores.get(player.name) || 0)
  }));
  
  // Sort by total score (highest first)
  finalPlayerList.sort((a, b) => b.score - a.score);
  
  return finalPlayerList;
}

// DEPRECATED - Keep old functions for backwards compatibility but don't use them
export function addAssignedScore(team: Team, score: number) {
  console.warn("addAssignedScore is deprecated. Use tallyMatchScore instead.");
  team[0].score += score;
  team[1].score += score;
}

export function makeAssignedScore(team: Team, score: number) {
  console.warn("makeAssignedScore is deprecated. Use tallyMatchScore instead.");
  team[0].score = score;
  team[1].score = score;
}

// Optional: Helper function to reset all player scores to 0
export function resetPlayerScores(players: Player[]): void {
  players.forEach(player => {
    player.score = 0;
  });
}

// Optional: Helper function to get player statistics
export function getPlayerStats(games: Schedule): Map<string, {
  matchesPlayed: number;
  totalScore: number;
  averageScore: number;
}> {
  const stats = new Map<string, {
    matchesPlayed: number;
    totalScore: number;
    averageScore: number;
  }>();
  
  for (let i = 0; i < games.length; i++) {
    const session = games[i];
    for (let j = 0; j < session.length; j++) {
      const match: Match = session[j];
      
      // Skip BYE matches
      if (match.team1[0].name === "BYE" || match.team2[0].name === "BYE") {
        continue;
      }
      
      // Update stats for team1 players
      match.team1.forEach(player => {
        const currentStats = stats.get(player.name) || {
          matchesPlayed: 0,
          totalScore: 0,
          averageScore: 0
        };
        
        currentStats.matchesPlayed += 1;
        currentStats.totalScore += match.score1;
        currentStats.averageScore = currentStats.totalScore / currentStats.matchesPlayed;
        
        stats.set(player.name, currentStats);
      });
      
      // Update stats for team2 players
      match.team2.forEach(player => {
        const currentStats = stats.get(player.name) || {
          matchesPlayed: 0,
          totalScore: 0,
          averageScore: 0
        };
        
        currentStats.matchesPlayed += 1;
        currentStats.totalScore += match.score2;
        currentStats.averageScore = currentStats.totalScore / currentStats.matchesPlayed;
        
        stats.set(player.name, currentStats);
      });
    }
  }
  
  return stats;
}