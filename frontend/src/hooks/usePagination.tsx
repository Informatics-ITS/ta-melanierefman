import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const usePagination = <T,>(itemsPerPage: number, data: T[], useRouterPagination = true) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localPage, setLocalPage] = useState(1);

  const currentPage = useRouterPagination
    ? parseInt(searchParams.get("page") || "1", 10)
    : localPage;

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const setPage = (page: number) => {
    if (useRouterPagination) {
      setSearchParams({ page: String(page) });
    } else {
      setLocalPage(page);
    }
  };

  return { currentPage, paginatedData, setPage };
};

export default usePagination;