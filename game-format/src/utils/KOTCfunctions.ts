import {Player, Team, Match, TournamentState} from "@/types";

// Generate teams from player names (strings)
export function generateTeams(playerNames: string[]): Team[] {
    const players: Player[] = playerNames.map(name => ({ id: name, score: 0 }));
    return createTeam(players);
}

// create from players a bunch of non-king teams
export function createTeam(players: Player[]): Team[] {
    const randomPlayers: Player[] = [...players].sort(() => Math.random() - 0.5); 
    const teamList: Team[] = [];
    
    if (randomPlayers.length % 2 === 1) {
        const singlePlayer = randomPlayers.shift();
        const singleTeam: Team = {
            id: singlePlayer!.id, 
            type: 'single' as const, 
            player1: singlePlayer!, // Store as string, not Player object
            isKing: false, 
            score: 0
        };
        teamList.push(singleTeam);
    } 
    
    while (randomPlayers.length >= 2) {
        const player1 = randomPlayers.shift();
        const player2 = randomPlayers.shift();
        const team: Team = {
            id: `${player1!.id} & ${player2!.id}`, 
            type: 'pair', 
            player1: player1!, // Store as string
            player2: player2!, // Store as string
            isKing: false, 
            score: 0
        };
        teamList.push(team);
    }
    return teamList;
}

// initialise n kings (with n = number of courts) and a queue of challengers 
export function initialise(teams: Team[], numOfCourts: number): TournamentState {
    const randomTeams = [...teams].sort(() => Math.random() - 0.5);
    const kingList: Team[] = [];
    const initialMatches: Match[] = [];
    
    // Need at least 2 * numOfCourts teams to start
    if (randomTeams.length < 2 * numOfCourts) {
        throw new Error(`Not enough teams. Need at least ${2 * numOfCourts} teams for ${numOfCourts} courts.`);
    }
    
    for (let i = 0; i < numOfCourts; i++) {
        const king = initialiseKing(randomTeams.shift()!);
        kingList.push(king);
        const challenger = randomTeams.shift()!;
        const match: Match = {
            id: `${king.id}-vs-${challenger.id}`, 
            type: 'double' as const, 
            king: king, 
            challenger: challenger, 
            score1: 0, 
            score2: 0,
            court: i + 1 // Assign court number
        };
        initialMatches.push(match);
    }
    
    const participatingTeams = randomTeams;
    const initialState: TournamentState = {
        numOfCourts: numOfCourts,
        pendingMatches: [],
        currentMatches: initialMatches,
        finishedMatches: [],
        participatingTeams: participatingTeams,
        kings: kingList
    };
    
    return initialState;
}

// choose the first kings and initialise their score to -2
export function initialiseKing(team: Team): Team {
    const kingTeam = { ...team }; // Create a copy to avoid mutations
    kingTeam.isKing = true;
    kingTeam.score = -2;
    return kingTeam;
}

export function makeKing(team: Team): Team {
    const newKing = { ...team };
    newKing.isKing = true;
    return newKing;
}

export function advanceMatch(match: Match, currentState: TournamentState): TournamentState {
    const winner = (match.score1! > match.score2!) ? match.king! : match.challenger!;
    const loser = (match.score1! < match.score2!) ? match.king! : match.challenger!;
    
    const newState: TournamentState = {
        ...currentState,
        currentMatches: [...currentState.currentMatches],
        finishedMatches: [...currentState.finishedMatches],
        participatingTeams: [...currentState.participatingTeams!],
        kings: [...currentState.kings!]
    };
    
    // Remove the completed match from current matches
    newState.currentMatches = newState.currentMatches.filter((oldMatch) => match.id !== oldMatch.id);
    
    // Add match to finished matches
    const finishedMatch = { ...match, winner: winner };
    newState.finishedMatches.push(finishedMatch);
    
    // Check if there are enough teams to continue
    if (newState.participatingTeams!.length === 0) {
        // No more challengers available, tournament ends for this court
        return newState;
    }
    
    const court = match.court!;
    
    if (winner.isKing) { 
        // King wins - increment score and get new challenger
        const updatedKing = { ...winner };
        updatedKing.score += 1;
        
        // Update the king in the kings array
        newState.kings = newState.kings!.map(king => 
            king.id === updatedKing.id ? updatedKing : king
        );
        
        // Old challenger goes back to queue
        const updatedLoser = { ...loser };
        updatedLoser.isKing = false;
        newState.participatingTeams!.push(updatedLoser);
        
        // Get new challenger from front of queue
        const newChallenger = newState.participatingTeams!.shift()!;
        
        // Create new match
        const newMatch: Match = {
            id: `${updatedKing.id}-vs-${newChallenger.id}`, 
            type: 'double' as const, 
            king: updatedKing, 
            challenger: newChallenger, 
            score1: 0, 
            score2: 0,
            court: court
        };
        newState.currentMatches.push(newMatch);
        
    } else { 
        // Challenger wins - becomes new king
        const newKing = makeKing(winner);
        
        // Remove old king from kings array and add new king
        newState.kings = newState.kings!.filter(king => king.id !== loser.id);
        newState.kings.push(newKing);
        
        // Old king goes back to queue as regular team
        const dethroned = { ...loser };
        dethroned.isKing = false;
        newState.participatingTeams!.push(dethroned);
        
        // Get new challenger from front of queue
        const newChallenger = newState.participatingTeams!.shift()!;
        
        // Create new match
        const newMatch: Match = {
            id: `${newKing.id}-vs-${newChallenger.id}`, 
            type: 'double' as const, 
            king: newKing, 
            challenger: newChallenger, 
            score1: 0, 
            score2: 0,
            court: court
        };
        newState.currentMatches.push(newMatch);
    }
    
    return newState;
}

export function sortTeamByScores(teams: Team[]): Team[] {
    return [...teams].sort((a, b) => b.score - a.score);
}

export function getTeamsFromMatches(matchList: Match[]): Team[] {
    const teamList : Team[] = [];
    for (let i = 0; i < matchList.length; i++) {
        if (matchList[i].party1) {
            const team1 = matchList[i].party1 as Team;
            if (!team1.isKing) {
                teamList.push(team1);
            }
        }
        if (matchList[i].party2) {
            const team2 = matchList[i].party2 as Team;
            if (!team2.isKing) {
                teamList.push(team2);
            } 
        }
    }
    return teamList;
}