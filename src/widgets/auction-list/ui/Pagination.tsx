import { Button } from '@/shared/ui';

interface PaginationProps {
  page: number;
  pagesCount: number;
  total: number;
  onPageChange: (page: number) => void;
}

function buildPages(page: number, pagesCount: number): number[] {
  const around = 1;
  const pages = new Set<number>([1, pagesCount]);

  for (let candidate = page - around; candidate <= page + around; candidate += 1) {
    if (candidate >= 1 && candidate <= pagesCount) {
      pages.add(candidate);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

export function Pagination({ page, pagesCount, total, onPageChange }: PaginationProps) {
  if (pagesCount <= 1) {
    return <p className="text-xs text-slate-500">Всего аукционов: {total}</p>;
  }

  const pages = buildPages(page, pagesCount);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Пагинация">
      <p className="text-xs text-slate-500">
        Всего аукционов: {total} · страница {page} из {pagesCount}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </Button>
        {pages.map((candidate, index) => {
          const previous = pages[index - 1];
          const gap = previous !== undefined && candidate - previous > 1;

          return (
            <span key={candidate} className="flex items-center gap-1">
              {gap && <span className="px-1 text-xs text-slate-400">…</span>}
              <Button
                variant={candidate === page ? 'primary' : 'ghost'}
                size="sm"
                aria-current={candidate === page ? 'page' : undefined}
                onClick={() => onPageChange(candidate)}
              >
                {candidate}
              </Button>
            </span>
          );
        })}
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pagesCount}
          onClick={() => onPageChange(page + 1)}
        >
          Вперёд
        </Button>
      </div>
    </nav>
  );
}
