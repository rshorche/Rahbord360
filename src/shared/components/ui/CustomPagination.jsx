import { useState, useEffect, useCallback } from "react";
import Button from "./Button";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

const CustomPagination = ({ gridApi, pageSizeOptions = [10, 20, 50, 100] }) => {
  const [pageState, setPageState] = useState({
    currentPage: 0,
    totalPages: 0,
    pageSize: pageSizeOptions[0],
  });

  const updatePageState = useCallback(() => {
    if (gridApi) {
      setPageState({
        currentPage: gridApi.paginationGetCurrentPage() + 1,
        totalPages: gridApi.paginationGetTotalPages(),
        pageSize: gridApi.paginationGetPageSize(),
      });
    }
  }, [gridApi]);

  useEffect(() => {
    if (!gridApi) return;
    gridApi.addEventListener("paginationChanged", updatePageState);
    updatePageState();
    return () =>
      gridApi.removeEventListener("paginationChanged", updatePageState);
  }, [gridApi, updatePageState]);

  if (!gridApi || pageState.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages, pageSize } = pageState;

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    gridApi.setGridOption("paginationPageSize", newSize);
  };

  return (
    <div className="flex flex-wrap-reverse items-center justify-center sm:justify-between gap-4 px-4 py-2 text-sm">
      <div className="flex items-center gap-2">
        <label
          htmlFor="page-size-select"
          className="whitespace-nowrap text-content-600">
          تعداد در صفحه:
        </label>
        <div className="relative">
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-9 w-20 appearance-none cursor-pointer rounded-md border border-content-300 bg-white pl-3 pr-7 text-sm text-content-800 outline-none ">
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size.toLocaleString("fa-IR")}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-content-500">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => gridApi.paginationGoToPreviousPage()}
          disabled={currentPage === 1}
          title="صفحه قبلی"
          className="h-9 w-9 text-content-600">
          <ChevronRight size={20} />
        </Button>

        <span className="font-semibold text-content-800 tabular-nums">
          صفحه {currentPage.toLocaleString("fa-IR")} از
          {totalPages.toLocaleString("fa-IR")}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => gridApi.paginationGoToNextPage()}
          disabled={currentPage === totalPages}
          title="صفحه بعدی"
          className="h-9 w-9 text-content-600">
          <ChevronLeft size={20} />
        </Button>
      </div>
    </div>
  );
};

export default CustomPagination;
