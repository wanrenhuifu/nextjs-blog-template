import type { LmArenaItem } from "@/lib/types";

interface LmArenaTableProps {
  items: LmArenaItem[];
}

const podiumBorder = (rank: number) => {
  if (rank === 1) return "border-l-primary bg-primary/5";
  if (rank === 2) return "border-l-accent-3 bg-accent-3/5";
  if (rank === 3) return "border-l-accent-2 bg-accent-2/5";
  return "";
};

const rankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-primary text-on-primary shadow-sm shadow-primary/20";
    case 2:
      return "bg-accent-3/20 text-accent-3 ring-1 ring-accent-3/30";
    case 3:
      return "bg-accent-2/15 text-accent-2 ring-1 ring-accent-2/25";
    default:
      return "bg-hover text-muted";
  }
};

export function LmArenaTable({ items }: LmArenaTableProps) {
  return (
    <div className="overflow-x-auto" role="table" aria-label="模型排行榜">
      {/* Visually hidden header for screen readers */}
      <div role="row" className="sr-only">
        <span role="columnheader">排名</span>
        <span role="columnheader">模型</span>
        <span role="columnheader">厂商</span>
      </div>

      {/* Body */}
      <div className="divide-y divide-borderline/40">
        {items.map((item) => (
          <div
            key={`${item.rank}-${item.model}`}
            role="row"
            className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-5 py-3 border-l-2 border-l-transparent transition-colors duration-200 hover:bg-hover/50 ${podiumBorder(
              item.rank
            )}`}
          >
            {/* Rank */}
            <span
              role="cell"
              className={`justify-self-center inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold tabular-nums ${rankBadge(
                item.rank
              )}`}
            >
              {item.rank}
            </span>

            {/* Model */}
            <span
              role="cell"
              title={item.model}
              className={`font-sans tracking-tight truncate ${
                item.rank <= 3
                  ? "text-sm font-semibold text-title"
                  : item.rank <= 10
                  ? "text-sm text-body"
                  : "text-xs text-body/80"
              }`}
            >
              {item.model}
            </span>

            {/* Org */}
            <span
              role="cell"
              title={item.org}
              className="text-xs text-muted pr-2 truncate max-w-[8rem] sm:max-w-none"
            >
              {item.org}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
