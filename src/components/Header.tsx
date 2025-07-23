import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type Props = {
  className?: string;
};

export default function Header({ className: wrapperClass }: Props) {
  return (
    <header
      className={cn(
        "p-2 flex gap-2 text-black justify-between",
        wrapperClass
      )}
    >
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>
      </nav>
    </header>
  );
}
