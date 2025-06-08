import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";

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
  empty: "انتخاب کنید",
  true: "درست",
  false: "غلط",
};

const AgGridTable = ({
  rowData,
  columnDefs,
  pageSize = 10,
  height = "65vh",
  domLayout = "normal",
  ...agGridProps
}) => {
  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
      sortable: true,
      minWidth: 100,
    };
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: height, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[10, 20, 50]}
        domLayout={domLayout}
        enableRtl={true}
        localeText={persianLocaleText}
        {...agGridProps}
      />
    </div>
  );
};

export default AgGridTable;
