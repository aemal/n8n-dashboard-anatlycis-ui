import { useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-provider";
import type { ExecutionLog } from "@shared/schema";
import { format } from "date-fns";
import { AlertCircle, Loader2 } from "lucide-react";

interface ExecutionTableProps {
  data: ExecutionLog[];
  isLoading?: boolean;
  error?: string | null;
}

const StatusCellRenderer = (params: ICellRendererParams) => {
  const status = params.value as string;
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    success: "default",
    error: "destructive",
    running: "secondary",
    waiting: "outline",
    canceled: "secondary",
  };

  const colors: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    error: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    running: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    waiting: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    canceled: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  };

  return (
    <Badge
      variant={variants[status] || "secondary"}
      className={`${colors[status] || ""} font-medium capitalize`}
    >
      {status}
    </Badge>
  );
};

const DateCellRenderer = (params: ICellRendererParams) => {
  if (!params.value) return <span className="text-muted-foreground">-</span>;
  try {
    return (
      <span className="text-sm">
        {format(new Date(params.value), "MMM dd, yyyy HH:mm:ss")}
      </span>
    );
  } catch {
    return <span className="text-muted-foreground">Invalid date</span>;
  }
};

const DurationCellRenderer = (params: ICellRendererParams) => {
  const ms = params.value as number | null;
  if (ms === null || ms === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }
  if (ms < 1000) {
    return <span>{ms}ms</span>;
  }
  if (ms < 60000) {
    return <span>{(ms / 1000).toFixed(1)}s</span>;
  }
  return <span>{(ms / 60000).toFixed(1)}m</span>;
};

export function ExecutionTable({ data, isLoading, error }: ExecutionTableProps) {
  const { resolvedTheme } = useTheme();

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "workflow_name",
        headerName: "Workflow",
        flex: 2,
        minWidth: 200,
        filter: true,
        sortable: true,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        cellRenderer: StatusCellRenderer,
        filter: true,
        sortable: true,
      },
      {
        field: "started_at",
        headerName: "Started",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: DateCellRenderer,
        sortable: true,
      },
      {
        field: "finished_at",
        headerName: "Finished",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: DateCellRenderer,
        sortable: true,
      },
      {
        field: "duration_ms",
        headerName: "Duration",
        flex: 1,
        minWidth: 100,
        cellRenderer: DurationCellRenderer,
        sortable: true,
      },
      {
        field: "mode",
        headerName: "Mode",
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        valueFormatter: (params) => params.value || "-",
      },
      {
        field: "node_count",
        headerName: "Nodes",
        flex: 0.7,
        minWidth: 80,
        sortable: true,
        valueFormatter: (params) =>
          params.value !== null ? params.value : "-",
      },
      {
        field: "error_message",
        headerName: "Error",
        flex: 2,
        minWidth: 200,
        tooltipField: "error_message",
        valueFormatter: (params) => params.value || "-",
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
    }),
    []
  );

  const getRowClass = useCallback((params: { data: ExecutionLog }) => {
    if (params.data?.status === "error") {
      return "bg-red-500/5";
    }
    return "";
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Execution Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Execution Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-amber-500" />
            <span className="text-sm font-medium">Unable to load execution logs</span>
            <span className="text-xs max-w-md text-center">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[500px] w-full ag-theme-quartz"
          style={{
            "--ag-background-color": "hsl(var(--card))",
            "--ag-header-background-color": "hsl(var(--muted))",
            "--ag-odd-row-background-color": "hsl(var(--card))",
            "--ag-row-hover-color": "hsl(var(--accent))",
            "--ag-selected-row-background-color": "hsl(var(--primary) / 0.1)",
            "--ag-border-color": "hsl(var(--border))",
            "--ag-header-foreground-color": "hsl(var(--foreground))",
            "--ag-foreground-color": "hsl(var(--foreground))",
            "--ag-font-family": "var(--font-sans)",
            "--ag-font-size": "14px",
            "--ag-row-height": "48px",
            "--ag-header-height": "48px",
          } as React.CSSProperties}
          data-testid="execution-table"
        >
          <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowClass={getRowClass}
            animateRows={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            domLayout="normal"
            suppressMovableColumns={true}
            theme="legacy"
          />
        </div>
      </CardContent>
    </Card>
  );
}
