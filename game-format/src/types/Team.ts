import { Player } from "./Player";

export interface Team {
  id: string;
  type: "single" | "pair";
  player1: Player;
  player2?: Player;
  score: number;
  rank?: number;
  isKing?: boolean;
}
