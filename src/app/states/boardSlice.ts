import type {  PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { pieceBoardPlacer, type Piece, type Position } from "../utils/initialStateGenerator";

interface BoardSlice {
  pieces: Map<string, Piece>;
  selectedPieceId: string | null;
  moveHistory: string[];
  checkStatus: "none" | "check" | "checkmate";
  turn: "white" | "black";
}

const initialState: BoardSlice = {
  pieces: pieceBoardPlacer(),
  selectedPieceId: null,
  moveHistory: [],
  checkStatus: "none",
  turn: "white",
};

const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rows = ["1", "2", "3", "4", "5", "6", "7", "8"];

const isValidSquare = (pos: Position): boolean => {
  return columns.includes(pos.letters) && rows.includes(pos.number);
};

const getPositionDelta = (from: Position, to: Position): { dx: number; dy: number } => {
  const colIndexFrom = columns.indexOf(from.letters);
  const colIndexTo = columns.indexOf(to.letters);
  const rowIndexFrom = rows.indexOf(from.number);
  const rowIndexTo = rows.indexOf(to.number);
  return { dx: colIndexTo - colIndexFrom, dy: rowIndexTo - rowIndexFrom };
};

const isPathClear = (
  from: Position,
  to: Position,
  pieces: Map<string, Piece>,
  dx: number,
  dy: number
): boolean => {
  const colIndexFrom = columns.indexOf(from.letters);
  const rowIndexFrom = rows.indexOf(from.number);

  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

  for (let i = 1; i < steps; i++) {
    const checkCol = columns[colIndexFrom + i * stepX];
    const checkRow = rows[rowIndexFrom + i * stepY];
    if (!checkCol || !checkRow) return false;
    const position = { letters: checkCol, number: checkRow };
    if (
      Array.from(pieces.values()).some(
        (p) => p.position.letters === position.letters && p.position.number === position.number
      )
    ) {
      return false;
    }
  }
  return true;
};

const validateMove = (
  piece: Piece,
  newPosition: Position,
  pieces: Map<string, Piece>,
  checkKingSafety: boolean = true
): boolean => {
  if (!isValidSquare(newPosition)) {
    console.log(`Invalid square: ${newPosition.letters}${newPosition.number}`);
    return false;
  }

  const { dx, dy } = getPositionDelta(piece.position, newPosition);
  const targetPiece = Array.from(pieces.values()).find(
    (p) => p.position.letters === newPosition.letters && p.position.number === newPosition.number
  );

  if (targetPiece && targetPiece.color === piece.color) {
    console.log(`Blocked by same color piece at ${newPosition.letters}${newPosition.number}`);
    return false;
  }

  let isValid = false;
  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? 1 : -1;
      const startRow = piece.color === "white" ? "2" : "7";
      if (dx === 0 && dy === direction && !targetPiece) {
        console.log("Valid pawn move: one square forward");
        isValid = true;
      } else if (
        dx === 0 &&
        dy === 2 * direction &&
        piece.position.number === startRow &&
        !targetPiece &&
        isPathClear(piece.position, newPosition, pieces, dx, dy)
      ) {
        console.log("Valid pawn move: double move");
        isValid = true;
      } else if (Math.abs(dx) === 1 && dy === direction && targetPiece) {
        console.log("Valid pawn capture");
        isValid = true;
      } else {
        console.log(`Invalid pawn move: dx=${dx}, dy=${dy}, target=${!!targetPiece}`);
      }
      break;

    case "knight":
      const isKnightMove =
        (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2);
      if (isKnightMove) {
        console.log("Valid knight move");
        isValid = true;
      } else {
        console.log(`Invalid knight move: dx=${dx}, dy=${dy}`);
      }
      break;

    case "bishop":
      const isBishopMove = Math.abs(dx) === Math.abs(dy);
      if (isBishopMove && isPathClear(piece.position, newPosition, pieces, dx, dy)) {
        console.log("Valid bishop move");
        isValid = true;
      } else {
        console.log(`Invalid bishop move: dx=${dx}, dy=${dy}, pathClear=${isPathClear(piece.position, newPosition, pieces, dx, dy)}`);
      }
      break;

    case "rook":
      const isRookMove = dx === 0 || dy === 0;
      if (isRookMove && isPathClear(piece.position, newPosition, pieces, dx, dy)) {
        console.log("Valid rook move");
        isValid = true;
      } else {
        console.log(`Invalid rook move: dx=${dx}, dy=${dy}, pathClear=${isPathClear(piece.position, newPosition, pieces, dx, dy)}`);
      }
      break;

    case "queen":
      const isQueenMove = (dx === 0 || dy === 0) || Math.abs(dx) === Math.abs(dy);
      if (isQueenMove && isPathClear(piece.position, newPosition, pieces, dx, dy)) {
        console.log("Valid queen move");
        isValid = true;
      } else {
        console.log(`Invalid queen move: dx=${dx}, dy=${dy}, pathClear=${isPathClear(piece.position, newPosition, pieces, dx, dy)}`);
      }
      break;

    case "king":
      const isKingMove = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      if (isKingMove) {
        console.log("Valid king move");
        isValid = true;
      } else {
        console.log(`Invalid king move: dx=${dx}, dy=${dy}`);
      }
      break;

    default:
      console.log(`Unknown piece type: ${piece.type}`);
      return false;
  }

  if (isValid && checkKingSafety) {
    // Simulate the move to check if it leaves own king in check
    const tempPieces = new Map(pieces);
    if (targetPiece && targetPiece.color !== piece.color) {
      tempPieces.delete(targetPiece.id);
    }
    const updatedPiece = { ...piece, position: newPosition };
    tempPieces.set(piece.id, updatedPiece);
    const king = Array.from(tempPieces.values()).find(
      (p) => p.type === "king" && p.color === piece.color
    );
    if (king && isKingInCheck(piece.color, tempPieces)) {
      console.log(`Move rejected: leaves own king in check`);
      return false;
    }
  }

  return isValid;
};

const isKingInCheck = (color: "white" | "black", pieces: Map<string, Piece>): boolean => {
  const king = Array.from(pieces.values()).find(
    (p) => p.type === "king" && p.color === color
  );
  if (!king) {
    console.log(`King not found for color: ${color}`);
    return false;
  }

  const opponentColor = color === "white" ? "black" : "white";
  for (const piece of Array.from(pieces.values())) {
    if (piece.color === opponentColor) {
      // Check if opponent piece can legally move to king's position
      // Skip king safety check to avoid recursion
      if (validateMove(piece, king.position, pieces, false)) {
        console.log(`King in check by ${piece.id} at ${piece.position.letters}${piece.position.number}`);
        return true;
      }
    }
  }
  return false;
};

const hasLegalMovesToEscapeCheck = (color: "white" | "black", pieces: Map<string, Piece>): boolean => {
  const playerPieces = Array.from(pieces.values()).filter((p) => p.color === color);
  for (const piece of playerPieces) {
    for (const letter of columns) {
      for (const number of rows) {
        const newPosition = { letters: letter, number };
        if (validateMove(piece, newPosition, pieces)) {
          // Simulate the move
          const tempPieces = new Map(pieces);
          const targetPiece = Array.from(tempPieces.values()).find(
            (p) => p.position.letters === newPosition.letters && p.position.number === newPosition.number
          );
          if (targetPiece && targetPiece.color !== piece.color) {
            tempPieces.delete(targetPiece.id);
          }
          const updatedPiece = { ...piece, position: newPosition };
          tempPieces.set(piece.id, updatedPiece);
          // Check if move escapes check
          if (!isKingInCheck(color, tempPieces)) {
            console.log(`Escape move found: ${piece.id} to ${newPosition.letters}${newPosition.number}`);
            return true;
          }
        }
      }
    }
  }
  console.log(`No legal moves to escape check for ${color}`);
  return false;
};

export const boardState = createSlice({
  name: "boardCreator",
  initialState,
  reducers: {
    selectPiece: (state, action: PayloadAction<string | null>) => {
      state.selectedPieceId = action.payload;
    },
    movePiece: (
      state,
      action: PayloadAction<{
        pieceId: string;
        newPosition: Position;
      }>
    ) => {
      const { pieceId, newPosition } = action.payload;
      const piece = state.pieces.get(pieceId);
      if (!piece) {
        console.log(`Piece not found: ${pieceId}`);
        return;
      }
      if (piece.color !== state.turn) {
        console.log(`Not ${piece.color}'s turn, current turn: ${state.turn}`);
        return;
      }
      if (validateMove(piece, newPosition, state.pieces)) {
        const oldPosition = piece.position;
        const targetPiece = Array.from(state.pieces.values()).find(
          (p) => p.position.letters === newPosition.letters && p.position.number === newPosition.number
        );
        if (targetPiece && targetPiece.color !== piece.color) {
          console.log(`Capturing piece: ${targetPiece.id}`);
          state.pieces.delete(targetPiece.id);
        }
        piece.position = newPosition;
        piece.hasMoved = true;
        state.pieces.set(pieceId, piece);
        const moveNotation = `${oldPosition.letters}${oldPosition.number}-${newPosition.letters}${newPosition.number}`;
        state.moveHistory.push(moveNotation);
        state.turn = state.turn === "white" ? "black" : "white";
        state.selectedPieceId = null;

        // Update check status
        const opponentColor = state.turn;
        if (isKingInCheck(opponentColor, state.pieces)) {
          if (!hasLegalMovesToEscapeCheck(opponentColor, state.pieces)) {
            state.checkStatus = "checkmate";
            console.log(`${opponentColor} is in checkmate`);
          } else {
            state.checkStatus = "check";
            console.log(`${opponentColor} is in check`);
          }
        } else {
          state.checkStatus = "none";
          console.log("No check");
        }
        console.log(`Move executed: ${moveNotation}`);
      } else {
        console.log(`Move rejected for ${pieceId} to ${newPosition.letters}${newPosition.number}`);
      }
    },
    resetBoard: (state) => {
      state.pieces = pieceBoardPlacer();
      state.selectedPieceId = null;
      state.moveHistory = [];
      state.checkStatus = "none";
      state.turn = "white";
    },
  },
});

export const { selectPiece, movePiece, resetBoard } = boardState.actions;
export default boardState.reducer;