import './Pagination.css'

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ‹
      </button>
      <span className="page-info">{page} / {totalPages}</span>
      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  )
}

export default Pagination