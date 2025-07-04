import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { cn } from "../../utils/cn";
import CustomPagination from "./CustomPagination";
import LoadingSpinner from "./LoadingSpinner";

ModuleRegistry.registerModules([AllCommunityModule]);

const persianLocaleText = { /* ... محتوای ترجمه‌ها بدون تغییر ... */ };

const AgGridTable = ({
  rowData,
  columnDefs,
  pageSize = 10,
  className,
  isLoading = false,
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
          // بخش اصلی تغییرات اینجاست:
          loading={isLoading} // استفاده از پراپرتی جدید به جای showLoadingOverlay
          loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={loadingOverlayComponentParams}
          pagination={!isLoading && rowData && rowData.length > 0}
          paginationPageSize={pageSize}
          suppressPaginationPanel={true}
          domLayout="autoHeight"
          onGridReady={onGridReady}
          enableRtl={true}
          localeText={persianLocaleText}
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