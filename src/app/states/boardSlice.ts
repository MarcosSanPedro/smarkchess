import type {  PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { generateInitialState, type Piece, type Position } from "@/app/utils/initialStateGenerator";
import { produce } from "immer";

export interface BoardState {
  pieces: Map<string, Piece>;
  turn: "white" | "black";
  selectedPieceId: string | null;
  moveHistory: string[];
  checkStatus: "none" | "check" | "checkmate";
}

const initialState: BoardState = {
  pieces: generateInitialState(),
  turn: "white",
  selectedPieceId: null,
  moveHistory: [],
  checkStatus: "none",
};

export const validateMove = (
  piece: Piece,
  newPosition: Position,
  pieces: Map<string, Piece>
): boolean => {
  const { letters: fromLetter, number: fromNumber } = piece.position;
  const { letters: toLetter, number: toNumber } = newPosition;
  const fromCol = fromLetter.charCodeAt(0) - "a".charCodeAt(0);
  const toCol = toLetter.charCodeAt(0) - "a".charCodeAt(0);
  const fromRow = parseInt(fromNumber) - 1;
  const toRow = parseInt(toNumber) - 1;

  // Check if move is within board
  if (toCol < 0 || toCol > 7 || toRow < 0 || toRow > 7) return false;

  // Check if destination is same as current position
  if (fromLetter === toLetter && fromNumber === toNumber) return false;

  const pieceAtDest = Array.from(pieces.values()).find(
    (p) => p.position.letters === toLetter && p.position.number === toNumber
  );

  // Prevent capturing own piece
  if (pieceAtDest && pieceAtDest.color === piece.color) return false;

  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1;
      const startRow = piece.color === "white" ? 1 : 6;
      const oneStep = toRow === fromRow + direction && toCol === fromCol && !pieceAtDest;
      const twoStep =
        fromRow === startRow &&
        toRow === fromRow + 2 * direction &&
        toCol === fromCol &&
        !pieceAtDest &&
        !Array.from(pieces.values()).find(
          (p) => p.position.letters === toLetter && p.position.number === `${fromRow + direction + 1}`
        );
      const capture =
        toRow === fromRow + direction &&
        Math.abs(toCol - fromCol) === 1 &&
        pieceAtDest !== undefined &&
        pieceAtDest.color !== piece.color;

      return oneStep || twoStep || capture;
    }
    case "knight": {
      const colDiff = Math.abs(toCol - fromCol);
      const rowDiff = Math.abs(toRow - fromRow);
      return (colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2);
    }
    case "bishop": {
      if (Math.abs(toCol - fromCol) !== Math.abs(toRow - fromRow)) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, pieces);
    }
    case "rook": {
      if (toCol !== fromCol && toRow !== fromRow) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, pieces);
    }
    case "queen": {
      if (
        toCol !== fromCol &&
        toRow !== fromRow &&
        Math.abs(toCol - fromCol) !== Math.abs(toRow - fromRow)
      ) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, pieces);
    }
    case "king": {
      const colDiff = Math.abs(toCol - fromCol);
      const rowDiff = Math.abs(toRow - fromRow);
      return colDiff <= 1 && rowDiff <= 1;
    }
    default:
      return false;
  }
};

// Helper to check if path is clear for sliding pieces
const isPathClear = (
  fromCol: number,
  fromRow: number,
  toCol: number,
  toRow: number,
  pieces: Map<string, Piece>
): boolean => {
  const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;
  const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
  let col = fromCol + colStep;
  let row = fromRow + rowStep;

  while (col !== toCol || row !== toRow) {
    const letter = String.fromCharCode("a".charCodeAt(0) + col);
    const number = `${row + 1}`;
    if (
      Array.from(pieces.values()).find(
        (p) => p.position.letters === letter && p.position.number === number
      )
    ) {
      return false;
    }
    col += colStep;
    row += rowStep;
  }
  return true;
};

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    selectPiece: (state, action: PayloadAction<string | null>) => {
      state.selectedPieceId = action.payload;
    },
    movePiece: (
      state,
      action: PayloadAction<{ pieceId: string; newPosition: Position }>
    ) => {
      return produce(state, (draft) => {
        const { pieceId, newPosition } = action.payload;
        const piece = draft.pieces.get(pieceId);
        if (!piece) return;

        // Validate move
        if (!validateMove(piece, newPosition, draft.pieces)) {
          console.log(`Invalid move for ${piece.type} to ${newPosition.letters}${newPosition.number}`);
          return;
        }

        // Update position
        const from = `${piece.position.letters}${piece.position.number}`;
        const to = `${newPosition.letters}${newPosition.number}`;
        draft.pieces.set(pieceId, { ...piece, position: newPosition, hasMoved: true });

        // Handle captures
        const pieceAtDest = Array.from(draft.pieces.values()).find(
          (p) => p.position.letters === newPosition.letters && p.position.number === newPosition.number && p.id !== pieceId
        );
        if (pieceAtDest) {
          draft.pieces.delete(pieceAtDest.id);
        }

        // Update move history
        draft.moveHistory.push(`${from}-${to}`);
        draft.turn = draft.turn === "white" ? "black" : "white";
        draft.selectedPieceId = null;

        // TODO: Update checkStatus for check/checkmate
        draft.checkStatus = "none";
      });
    },
  },
});

export const { selectPiece, movePiece } = boardSlice.actions;
export default boardSlice.reducer;