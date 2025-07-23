import { configureStore } from '@reduxjs/toolkit'
import pieceSelectorReducer from './states/clickSlice'

export const store = configureStore({
  reducer: {
    selectedPiece: pieceSelectorReducer
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch