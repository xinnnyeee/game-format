interface Player {
    name: string, 
    score: number
}

interface Team {
    id: string,
    type: 'single' | 'pair',
    party1: Player, 
    party2?: Player,
    isKing: boolean, 
    score: number
}

interface Match {
    id: string,
    king: Team, 
    challenger: Team, 
    score1: number, 
    score2: number
}

interface TournamentState {
    currentMatches : Match[],
    challengersQueue : Team[], // for challengers not involved in any match
    kings : Team[]
}

// create from players a bunch of non-king teams
export function createTeam(players : Player[]) : Team[] {
    const randomPlayers : Player[] = players.sort(() => Math.random() - 0.5); 
    const teamList : Team[] = [];
    if (randomPlayers && randomPlayers.length % 2 == 1) {
        const singlePlayer = randomPlayers.shift();
        const singleTeam = {id: singlePlayer!.name, type: 'single' as const, party1: singlePlayer!, isKing: false, score: 0};
        teamList.push(singleTeam);
    } 
    while (randomPlayers.length >= 2) {
        const player1 = randomPlayers.shift();
        const player2 = randomPlayers.shift();
        const team : Team = {id: `${player1!.name}-${player2!.name}`, type: 'pair', party1: player1!, party2: player2!, isKing: false, score: 0};
        teamList.push(team);
    }
    return teamList;
}

// initialise n kings (with n = number of courts) and a queue of challengers 
export function initialise(players : Player[], numOfCourts : number) : TournamentState {
    const teamList = createTeam(players);
    const randomTeams = teamList.sort(() => Math.random() - 0.5);
    const kingList : Team[] = [];
    const initialMatches : Match[] = [];
    for (let i = 0; i < numOfCourts; i++) {
        const king = initialiseKing(randomTeams.shift()!);
        kingList.push(king);
        const challenger = randomTeams.shift()!;
        const match = {id: `${king.id}-vs-${challenger.id}`, king: king, challenger: challenger, score1: 0, score2: 0}; // scores of each match
        initialMatches.push(match);
    }
    const challengersQueue = randomTeams;
    return {
        currentMatches: initialMatches,
        challengersQueue: challengersQueue,
        kings: kingList
    }
}

// choose the first kings and initialise their score to -2
export function initialiseKing(team: Team) : Team {
    team.isKing = true;
    team.score = -2;
    return team;
}

export function makeKing(team: Team) {
    team.isKing = true;
}

export function advanceMatch(match : Match, currentState: TournamentState) : TournamentState {
    const winner = (match.score1 > match.score2) ? match.king : match.challenger;
    const loser = (match.score1 < match.score2) ? match.king : match.challenger;
    const newState = {...currentState};
    newState.currentMatches = currentState.currentMatches.filter((oldMatch) => match.id !== oldMatch.id); // remove current match
    if (winner.isKing) { // king wins
        winner.score += 1;
        newState.challengersQueue.push(loser);
        const newChallenger = newState.challengersQueue.shift()!;
        newState.currentMatches.push({id: `${winner.id}-vs-${newChallenger.id}`, king: winner, challenger: newChallenger, score1: 0, score2: 0}); 
    } else { // challenger wins
        winner.isKing = true;
        newState.kings.push(winner);
        newState.kings = newState.kings.filter((king) => king.id !== loser.id);
        loser.isKing = false;
        newState.challengersQueue.push(loser);
        const newKing = winner;
        const newChallenger = newState.challengersQueue.shift()!;
        const newMatch = {id: `${newKing.id}-vs-${newChallenger.id}`, king: newKing, challenger: newChallenger, score1:0, score2: 0};
        newState.currentMatches.push(newMatch);
    } 
    return newState;
}