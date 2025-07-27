import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectPiece, movePiece } from "@/app/states/boardSlice";
import { type Piece, type Position } from "@/app/utils/initialStateGenerator";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const rows = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const dispatch = useAppDispatch();
  const selectedPieceId = useAppSelector((state) => state.board.selectedPieceId);
  const pieces = useAppSelector((state) => state.board.pieces);
  const turn = useAppSelector((state) => state.board.turn);
  const moveHistory = useAppSelector((state) => state.board.moveHistory);

  const getLegalMoves = (piece: Piece): Position[] => {
    // TODO: Implement logic to calculate legal moves
    return [];
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const square = e.currentTarget;
    const letter = square.dataset.letter as string;
    const number = square.dataset.number as string;
    const pieceAtPosition = Array.from(pieces.values()).find(
      (p) => p.position.letters === letter && p.position.number === number
    );

    if (selectedPieceId && pieceAtPosition?.id !== selectedPieceId) {
      const selectedPiece = pieces.get(selectedPieceId);
      if (!selectedPiece) {
        console.log(`Selected piece not found: ${selectedPieceId}`);
        return;
      }

      if (pieceAtPosition && pieceAtPosition.color === selectedPiece.color) {
        console.log(`Reselecting piece: ${pieceAtPosition.id}`);
        dispatch(selectPiece(pieceAtPosition.id));
      } else {
        const originalPosition = { ...selectedPiece.position };
        dispatch(
          movePiece({
            pieceId: selectedPieceId,
            newPosition: { letters: letter, number },
          })
        );
        const updatedPiece = pieces.get(selectedPieceId);
        if (
          updatedPiece?.position.letters === letter &&
          updatedPiece?.position.number === number
        ) {
          console.log(`Move successful: ${originalPosition.letters}${originalPosition.number}-${letter}${number}`);
        } else {
          console.log(
            `Move failed: ${selectedPiece.id} from ${originalPosition.letters}${originalPosition.number} to ${letter}${number}`
          );
        }
      }
    } else if (pieceAtPosition && pieceAtPosition.color === turn) {
      console.log(`Selecting piece: ${pieceAtPosition.id}`);
      dispatch(selectPiece(pieceAtPosition.id));
    } else {
      console.log("Deselecting piece or invalid selection");
      dispatch(selectPiece(null));
    }
  };

  return (
    <div className="text-center flex justify-center h-full w-full">
      <div className="flex">
        <div className="aspect-square bg-blue-400 border-black border-4 grid grid-cols-8 w-auto h-auto">
          {rows.map((number: string, index: number) =>
            columns.map((letter, nIndex) => {
              const isSelected =
                selectedPieceId &&
                pieces.get(selectedPieceId)?.position.letters === letter &&
                pieces.get(selectedPieceId)?.position.number === number;
              const isLegalMove =
                selectedPieceId && pieces.get(selectedPieceId)
                  ? getLegalMoves(pieces.get(selectedPieceId)!).some(
                      (pos) => pos.letters === letter && pos.number === number
                    )
                  : false;

              return (
                <div
                  key={`${letter}${number}`}
                  id={`${letter}${number}`}
                  data-letter={letter}
                  data-number={number}
                  className={cn(
                    "hover:opacity-80 relative",
                    (index + nIndex) % 2 === 0 ? "bg-red-300" : "bg-black text-red-300",
                    isSelected ? "!bg-white" : "",
                    isLegalMove ? "bg-yellow-300" : ""
                  )}
                  onClick={handleClick}
                >
                  <PieceInPlace
                    letter={letter}
                    number={number}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl"
                  />
                </div>
              );
            })
          )}
        </div>
        <div className="ml-4 text-left">
          <p className="font-bold">Current Turn: {turn}</p>
          <p className="font-bold">Move History:</p>
          <ul className="list-disc pl-5">
            {moveHistory.length > 0 ? (
              moveHistory.map((move, index) => (
                <li key={index} className="text-sm">
                  {move}
                </li>
              ))
            ) : (
              <li className="text-sm">No moves yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface PieceInPlaceProps {
  letter: string;
  number: string;
  className: string;
}

const getPieceSymbol = (type: Piece["type"], color: Piece["color"]): string => {
  const symbols: Record<Piece["color"], Record<Piece["type"], string>> = {
    white: {
      pawn: "♙",
      knight: "♘",
      bishop: "♗",
      rook: "♖",
      queen: "♕",
      king: "♔",
    },
    black: {
      pawn: "♟",
      knight: "♞",
      bishop: "♝",
      rook: "♜",
      queen: "♛",
      king: "♚",
    },
  };
  return symbols[color][type];
};

export const PieceInPlace = ({ letter, number, className }: PieceInPlaceProps) => {
  const pieces = useAppSelector((state) => state.board.pieces);
  const pieceAtPosition = Array.from(pieces.values()).find(
    (piece) => piece.position.letters === letter && piece.position.number === number
  );

  return pieceAtPosition ? (
    <div className={cn(className)}>
      {getPieceSymbol(pieceAtPosition.type, pieceAtPosition.color)}
    </div>
  ) : null;
};