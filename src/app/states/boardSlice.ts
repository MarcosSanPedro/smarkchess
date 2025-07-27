import { createSlice } from "@reduxjs/toolkit";
import { stateGenerator, type Piece } from "../utils/initialStateGenerator";

interface BoardSilice {
  pieces: Map<string, Piece>
  selectedPieceId: string | null,
  moveHistory: string[], 
  checkStatus: 'none' | 'check' | 'check mate',
  turn: "black" | "white"
}

const initialState: BoardSilice = {
  pieces: stateGenerator(),
  selectedPieceId: null,
  moveHistory: [],
  checkStatus: 'none',
  turn: 'white',
  }



export const boardState = createSlice({
  name: 'boardCreator',
  initialState,
  reducers:{

  }


})