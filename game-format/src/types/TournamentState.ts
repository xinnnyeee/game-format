import {Match, Player, Team} from '@/types';

export interface TournamentState {
    numOfCourts : number,
    pendingMatches: Match[];
    finishedMatches: Match[];
    currentMatches: Match[]; // Changed from currentMatch to currentMatches array
    participatingPlayers?: Player[];
    participatingTeams?: Team[];
    king?: Team;
  }