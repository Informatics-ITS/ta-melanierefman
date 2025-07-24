import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Typography } from "../../atom/typography";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const generatePageLinks = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-typo-secondary select-none">
            ...
          </span>
        );
      }

      const isActive = page === currentPage;

      return onPageChange ? (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-1 rounded-md transition-colors duration-200 ${
            isActive ? "bg-primary text-white" : "text-typo-secondary hover:bg-gray-100"
          }`}
        >
          <Typography type="button">{page}</Typography>
        </button>
      ) : (
        <Link
          key={page}
          to={`?page=${page}`}
          className={`px-3 py-1 rounded-md transition-colors duration-200 ${
            isActive ? "bg-primary text-white" : "text-typo-secondary hover:bg-gray-100"
          }`}
        >
          <Typography type="button">{page}</Typography>
        </Link>
      );
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {onPageChange ? (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${
            currentPage === 1 ? "text-typo-inline cursor-not-allowed" : "text-typo-secondary"
          }`}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <Link
          to={`?page=${currentPage - 1}`}
          className={`${
            currentPage === 1 ? "text-typo-inline cursor-not-allowed" : "text-typo-secondary"
          }`}
          aria-disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </Link>
      )}

      {generatePageLinks()}

      {onPageChange ? (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${
            currentPage === totalPages ? "text-typo-inline cursor-not-allowed" : "text-typo-secondary"
          }`}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={20} />
        </button>
      ) : (
        <Link
          to={`?page=${currentPage + 1}`}
          className={`${
            currentPage === totalPages
              ? "text-typo-inline cursor-not-allowed"
              : "text-typo-secondary"
          }`}
          aria-disabled={currentPage === totalPages}
        >
          <ChevronRight size={20} />
        </Link>
      )}
    </div>
  );
};

export default Pagination;