import { createSlice } from "@reduxjs/toolkit";

interface PieceSelectedSlice {
  position: { letter: string; number: string } | {};
  selected: string;
}

const initialState: PieceSelectedSlice = {
  position: {},
  selected: "",
};

type SquerePayload = {
  id: string;
  [name: string]: string | undefined;
};

export const pieceSelectedSlice = createSlice({
  name: "selectedPiece",
  initialState,
  reducers: {
    selectPiece: (state, actions) => {
      const square = actions.payload as SquerePayload;
      state.position = {
        letter: square.letter,
        number: square.number,
      };
      console.log(square);
      
      if (!state.selected) {
        state.selected = square.id;
      } else if (state.selected === square.id) {
        state.selected = "";
      } else {
        state.selected = square.id;
      }
    },
  },
});

export const { selectPiece } = pieceSelectedSlice.actions;

export default pieceSelectedSlice.reducer;
