import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./states/boardSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore serializability checks for the board.pieces path
        ignoredPaths: ["board.pieces"],
        // Optionally, ignore specific actions if needed
        ignoredActions: ["boardCreator/selectPiece", "boardCreator/movePiece", "boardCreator/resetBoard"],
      },
    }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;