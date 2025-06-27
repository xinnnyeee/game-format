export type Player = {
    score: number;
    name: string;
  };
  
  export type Team = [Player, Player];
  export type Match = [Team, Team];
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
    if (numOfPlayers >= 12 && numOfPlayers <= 14) {
      return 3;
    } else if (numOfPlayers >= 8 && numOfPlayers < 12) {
      return 2;
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
    const playersCopy = [...players];
    const allMatches: Match[] = [];
    const numOfMatchesPerRound = generateMatchesPerRound(players.length);
    const offsets = players.length % 4;
  
    for (let i = 0; i < numOfRounds; i++) {
      offset(playersCopy);
      const validPlayers = offsets === 0 ? [...playersCopy] : playersCopy.slice(0, -offsets); // sit out some players
      const newMatches = generateMatchesFromPlayers(validPlayers);
      allMatches.push(...newMatches);
    }
  
    return generateSessionsFromMatches(allMatches, numOfMatchesPerRound);
  }
  
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
      matchList.push([t1, t2]);
    }
  
    return matchList;
  }
  
  
  export function generateSessionsFromMatches(matches: Match[], numOfMatchesPerRound: number): Session[] {
    const sessList: Session[] = [];
    const matchesCopy = [...matches];
    const dummyPlayer: Player = { name: "BYE", score: 0 };
    const dummyMatch: Match = [[dummyPlayer, dummyPlayer], [dummyPlayer, dummyPlayer]];
  
    if (numOfMatchesPerRound === 2) {
      while (matchesCopy.length >= 2) {
        const sess: Session = [matchesCopy.shift()!, matchesCopy.shift()!];
        sessList.push(sess);
      }
      if (matchesCopy.length === 1) {
        sessList.push([matchesCopy.pop()!, dummyMatch]);
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
  


    // list out all the possibilities for 8 players
    // 12 34 56 78 
    // 13 45 67 82
    // 14 56 78 23
    // 15 67 82 34
    // 16 78 23 45
    // 17 82 34 56
    // 18 23 45 67

    // 9 players
    // add one BYE player
    // whoever paired with BYE will sit out
    // 12 34 56 78 9B
    // 1B 23 45 67 89
    // 19 B2 34 56 78
    // 18 9B 23 45 67
    // 17 89 B2 34 56
    // 16 78 9B 23 45
    // 15 67 89 B2 34
    // 14 56 78 9B 23
    // 13 45 67 89 B2


    // 9 players alternative
    // exclude one player each round

    // 10 players
    // add BB, and whoever match with BB will sit out 
    // two players will sit out each round

    // 11 players
    // add B, whoever pair or match with B will sit out
    // 3players will sit out each round

    // list out all the possibilities for 12 players
    // ab cd ef gh ij kl
    // al bc de fg hi jk
    // ak lb cd ef gh ij 
    // aj kl bc de fg hi
    // ai jk lb cd ef gh
    // ah ij kl bc de fg 
    // ag hi jk lb cd ef 
    // af gh ij kl bc de 
    // ae fg hi jk lb cd
    // ad ef gh ij kl bc
    // ac de fg hi jk lb

    // sessions (first 4 rows)
    // ab cd & ef gh
    // ij kl & de fg
    // al bc & hi jk
    // ak lb & cd ef
    // gh ij & bc de
    // aj kl & fg hi
    // algo: take the n and n+2 index to pair into session, take until the N-2 

    // 13 players
    // add one B
    // whoever pair with B will sit out
    // the rest player like 12 players matches

    // 14 players
    // add two B
    // the team matching with BB will sit out
    // the rest play like 12 players matches





