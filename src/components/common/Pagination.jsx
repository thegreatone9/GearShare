import React from 'react';

/**
 * Pagination component — numbered pages with prev/next arrows and ellipsis.
 *
 * Props:
 *   currentPage  - 1-indexed current page
 *   totalPages   - total number of pages
 *   onPageChange - callback(pageNumber)
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Build page number array with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const SIBLINGS = 1; // pages to show on each side of current

        // Always show first page
        pages.push(1);

        const start = Math.max(2, currentPage - SIBLINGS);
        const end = Math.min(totalPages - 1, currentPage + SIBLINGS);

        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push('...');

        // Always show last page
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <nav className="pagination" aria-label="Page navigation">
            {/* Prev button */}
            <button
                className="pagination__btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                ‹
            </button>

            {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="pagination__ellipsis">…</span>
                ) : (
                    <button
                        key={page}
                        className={`pagination__btn ${page === currentPage ? 'pagination__btn--active' : ''}`}
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next button */}
            <button
                className="pagination__btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
}
