// Unit tests for refactored Player-based logic
import {
    offset,
    generateMatchesFromPlayers,
    generateRRMatches,
    generateDoubleMatchesFromPlayers,
    generateMatchesPerRound,
    generateSessionsFromMatches,
    Player,
    Match,
    Session,
  } from '../RRDoublesGenerator'; // Replace with actual relative path
  
  describe('offset()', () => {
    it('rotates players correctly', () => {
      const players: Player[] = [
        { name: 'A', score: 0 },
        { name: 'B', score: 0 },
        { name: 'C', score: 0 },
        { name: 'D', score: 0 }
      ];
      offset(players);
      expect(players.map(p => p.name)).toEqual(['A', 'D', 'B', 'C']);
    });
  
    it('handles empty list', () => {
      const players: Player[] = [];
      offset(players);
      expect(players).toEqual([]);
    });
  });
  
  describe('generateMatchesFromPlayers()', () => {
    it('generates correct matches from 8 players', () => {
      const players: Player[] = [
        'A','B','C','D','E','F','G','H'
      ].map(name => ({ name, score: 0 }));
  
      const matches = generateMatchesFromPlayers([...players]);
      expect(matches.length).toBe(2); // 4 teams = 2 matches
  
      matches.forEach(match => {
        match.forEach(team => {
          expect(team.length).toBe(2);
          team.forEach(player => {
            expect(typeof player.name).toBe('string');
            expect(player.score).toBe(0);
          });
        });
      });
    });
  
  });
  
  describe('generateMatchesPerRound()', () => {
    it('returns correct match count for 12 players', () => {
      expect(generateMatchesPerRound(12)).toBe(3);
    });
  
    it('returns -1 for too few players', () => {
      expect(generateMatchesPerRound(6)).toBe(-1);
    });
  
    it('returns 2 for 10 players', () => {
      expect(generateMatchesPerRound(10)).toBe(2);
    });
  });
  
  describe('generateRRMatches()', () => {
    it('returns empty schedule for <8 players', () => {
      const players = ['A','B','C','D','E','F','G'].map(name => ({ name, score: 0 }));
      const schedule = generateRRMatches(players);
      expect(schedule).toEqual([]);
    });
  
    it('returns a valid schedule structure', () => {
      const players = ['A','B','C','D','E','F','G','H'].map(name => ({ name, score: 0 }));
      const schedule = generateRRMatches(players);
      expect(Array.isArray(schedule)).toBe(true);
      schedule.forEach(session => {
        expect(session.length).toBe(2);
        session.forEach(match => {
          expect(match.length).toBe(2);
          match.forEach(team => {
            expect(team.length).toBe(2);
          });
        });
      });
    });
  });
  
  describe('generateSessionsFromMatches()', () => {
    it('groups matches into sessions correctly for 2-match rounds', () => {
      const dummyPlayer: Player = { name: 'P', score: 0 };
      const match: Match = [[dummyPlayer, dummyPlayer], [dummyPlayer, dummyPlayer]];
      const matches: Match[] = [match, match, match];
      const sessions = generateSessionsFromMatches(matches, 2);
      expect(sessions.length).toBe(2);
      expect(sessions[0].length).toBe(2);
    });
  
    it('handles 3-match rounds with leftovers', () => {
      const dummyPlayer: Player = { name: 'X', score: 0 };
      const match: Match = [[dummyPlayer, dummyPlayer], [dummyPlayer, dummyPlayer]];
      const matches: Match[] = Array(9).fill(match);
      const sessions = generateSessionsFromMatches(matches, 3);
      expect(sessions.length).toBeGreaterThan(0);
    });
  });
  