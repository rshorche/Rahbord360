import { useState, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { cn } from "../../utils/cn";
import CustomPagination from "./CustomPagination";
import LoadingSpinner from "./LoadingSpinner"; 

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
  isLoading = false, // پراپرتی جدید برای کنترل لودینگ
  ...agGridProps
}) => {
  const [gridApi, setGridApi] = useState(null);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    minWidth: 100,
  }), []);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  // این هوک وضعیت اسپینر را بر اساس پراپرتی isLoading کنترل می‌کند
  useEffect(() => {
    if (!gridApi) return;
    if (isLoading) {
      gridApi.showLoadingOverlay();
    } else {
      gridApi.hideOverlay();
    }
  }, [isLoading, gridApi]);

  const pageSizeOptions = useMemo(() => [10, 25, 50, 100], []);

  const loadingOverlayComponent = useMemo(() => LoadingSpinner, []);
  const loadingOverlayComponentParams = useMemo(() => ({
    text: "در حال بارگذاری داده‌ها...",
  }), []);

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="ag-theme-quartz w-full flex-grow">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={!isLoading && rowData && rowData.length > 0} // صفحه‌بندی فقط در صورت نبود لودینگ و وجود داده
          paginationPageSize={pageSize}
          suppressPaginationPanel={true}
          domLayout="autoHeight"
          onGridReady={onGridReady}
          enableRtl={true}
          localeText={persianLocaleText}
          loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={loadingOverlayComponentParams}
          {...agGridProps}
        />
      </div>
      {!isLoading && rowData && rowData.length > 0 && (
        <CustomPagination gridApi={gridApi} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
};

export default AgGridTable;