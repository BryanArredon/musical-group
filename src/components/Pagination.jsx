/**
 * RNF2-F — Escalabilidad de interfaz
 * Componente reutilizable de paginación.
 * Puede usarse en cualquier lista de la aplicación sin modificar su estructura.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav className="pagination" aria-label="Paginación de resultados">
      <button
        className="page-btn"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        title="Primera página"
      >
        «
      </button>
      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        ‹
      </button>

      {start > 1 && <span className="page-ellipsis">…</span>}

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span className="page-ellipsis">…</span>}

      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Página siguiente"
      >
        ›
      </button>
      <button
        className="page-btn"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        »
      </button>

      <span className="page-info">
        Página {currentPage} de {totalPages}
      </span>
    </nav>
  )
}
