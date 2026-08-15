export default function Pagination({ page, perPage, total, onChange }) {
    const lastPage = Math.max(1, Math.ceil(total / perPage))

    if (lastPage <= 1) return null

    const pages = []
    for (let i = 1; i <= lastPage; i++) {
        if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) {
            pages.push(i)
        } else if (pages[pages.length - 1] !== '…') {
            pages.push('…')
        }
    }

    return (
        <nav className="flex items-center gap-1 flex-wrap" aria-label="Pagination">
            <button
                type="button"
                className="btn-secondary !px-3 !py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
            >
                Précédent
            </button>

            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`dots-${i}`} className="px-2 text-neutral-400 text-sm">
                        …
                    </span>
                ) : (
                    <button
                        type="button"
                        key={p}
                        onClick={() => onChange(p)}
                        className={`btn-secondary !px-3 !py-1.5 ${p === page ? '!bg-accent !text-white !border-accent' : ''}`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                type="button"
                className="btn-secondary !px-3 !py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page >= lastPage}
                onClick={() => onChange(page + 1)}
            >
                Suivant
            </button>
        </nav>
    )
}
