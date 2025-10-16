import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Number of items per page
 * @param {function} onPageChange - Callback function when page changes
 * @param {string} itemName - Name of items being paginated (e.g., "requests", "products")
 */
export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  itemName = 'items'
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1) {
    return null
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const displayEnd = Math.min(indexOfLastItem, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page) => {
    onPageChange(page)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = 4
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      
      // Show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        {/* Items count */}
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {displayEnd} of {totalItems} {itemName}
        </div>
        
        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 font-medium"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 font-medium"
            aria-label="Next page"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
