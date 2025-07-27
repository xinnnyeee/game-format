import { Player, Team } from "./index";

export interface Match {
  id: string;
  type: "single" | "double";
  king?: Team; // KOTC special
  challenger?: Team; // KOTC special
  party1?: Team | Player;
  party2?: Team | Player;
  score1: number;
  score2: number;
  winner?: Team | Player;
  court?: number;
}
