import { useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { cn } from "../../utils/cn";
import CustomPagination from "./CustomPagination";

ModuleRegistry.registerModules([AllCommunityModule]);

const persianLocaleText = {
  selectAll: "(انتخاب همه)",
  deselectAll: "(لغو انتخاب همه)",
  loadingOoo: "در حال بارگذاری...",
  noRowsToShow: "داده‌ای برای نمایش وجود ندارد.",
  page: "صفحه",
  of: "از",
  to: "تا",
  firstPage: "اولین",
  lastPage: "آخرین",
  nextPage: "بعدی",
  previousPage: "قبلی",
  pageSizeSelectorLabel: "تعداد در صفحه:",
  filterOoo: "فیلتر...",
  applyFilter: "اعمال فیلتر",
  resetFilter: "بازنشانی فیلتر",
  clearFilter: "پاک کردن فیلتر",
  equals: "برابر با",
  notEqual: "مخالف با",
  contains: "شامل",
  notContains: "شامل نشود",
  startsWith: "شروع با",
  endsWith: "پایان با",
  blank: "خالی باشد",
  notBlank: "خالی نباشد",
  lessThan: "کمتر از",
  greaterThan: "بزرگتر از",
  lessThanOrEqual: "کمتر یا مساوی با",
  greaterThanOrEqual: "بزرگتر یا مساوی با",
  inRange: "در محدوده",
  inRangeStart: "از",
  inRangeEnd: "تا",
  empty: "انتخاب کنید...",
  true: "درست",
  false: "غلط",
};

const AgGridTable = ({
  rowData,
  columnDefs,
  pageSize = 10,
  className,
  ...agGridProps
}) => {
  const [gridApi, setGridApi] = useState(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: 100,
    }),
    []
  );

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const pageSizeOptions = useMemo(() => [10, 25, 50, 100], []);

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="ag-theme-quartz w-full flex-grow">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={pageSize}
          suppressPaginationPanel={true}
          domLayout="autoHeight"
          onGridReady={onGridReady}
          enableRtl={true}
          localeText={persianLocaleText}
          {...agGridProps}
        />
      </div>
      <CustomPagination gridApi={gridApi} pageSizeOptions={pageSizeOptions} />
    </div>
  );
};

export default AgGridTable;
