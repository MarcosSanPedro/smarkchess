export type Position = {
    letters: string;
    number: string;
  };
  
  export type Piece = {
    id: string;
    position: Position;
    type: "rook" | "knight" | "bishop" | "king" | "queen" | "pawn";
    color: "black" | "white";
    value: number;
    hasMoved: boolean;
  };
  
  export function generateInitialState(): Map<string, Piece> {
    const pieces = new Map<string, Piece>();
    const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const backRowOrder: Piece["type"][] = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];
    const backRowValues: number[] = [5, 3, 3, 10, 0, 3, 3, 5];
  
    (["white", "black"] as const).forEach((color: "white" | "black") => {
      const isWhite = color === "white";
      const pawnRow = isWhite ? "2" : "7";
      const backRow = isWhite ? "1" : "8";
  
      columns.forEach((col, index) => {
        // Place pawns
        const pawnId = `${color}_pawn_${index + 1}`;
        pieces.set(pawnId, {
          id: pawnId,
          position: { letters: col, number: pawnRow },
          type: "pawn",
          color,
          value: 1,
          hasMoved: false,
        });
  
        // Place back row pieces
        const type = backRowOrder[index];
        const backRowId = `${color}_${type}_${index + 1}`;
        pieces.set(backRowId, {
          id: backRowId,
          position: { letters: col, number: backRow },
          type,
          color,
          value: backRowValues[index],
          hasMoved: false,
        });
      });
    });
  
    return pieces;
  }