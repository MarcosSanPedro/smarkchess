import { createFileRoute } from "@tanstack/react-router";
import { lettersArrey, numbersArrey } from "@/app/states/boardSlice";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectPiece } from "@/app/states/clickSlice";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.selectedPiece.selected);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const square = e.currentTarget;
    square.attributes;
    dispatch(
      selectPiece({
        id: square.id,
        ...square.dataset,
      })
    );
  };

  return (
    <div className="text-center flex justify-center h-full w-full">
      <div
        className="
      aspect-square bg-blue-400 border-black border-4 grid grid-cols-8 w-auto h-auto"
      >
        {lettersArrey.map((letter: string, index: number) =>
          numbersArrey.map((number, nIndex) => {
            return (
              <div
                key={`${letter}${number}`}
                id={`${letter}${number}`}
                data-letter={letter}
                data-number={number}
                className={cn(
                  "hover:opacity-80",
                  (index + nIndex) % 2 === 0
                    ? "bg-red-300"
                    : "bg-black text-red-300",
                  `${letter}${number}` === selected ? "!bg-white" : ""
                )}
                onClick={(e) => handleClick(e)}
              >
                {letter}
                {number}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
