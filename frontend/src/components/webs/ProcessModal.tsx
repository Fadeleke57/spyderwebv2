import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useFetchAllProcesses } from "@/hooks/process";
import { Process } from "@/types/process";

const STATUS_CONFIG = {
  pending: {
    color: "secondary",
    icon: <Clock className="w-4 h-4 mr-2" />,
    description: "Waiting to start",
  },
  processing: {
    color: "warning",
    icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
    description: "In progress",
  },
  completed: {
    color: "success",
    icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
    description: "Successfully completed",
  },
  failed: {
    color: "destructive",
    icon: <AlertTriangle className="w-4 h-4 mr-2" />,
    description: "Process failed",
  },
};

function ProcessModal({
  webId,
  isOpen,
  onOpenChange,
  refetchWeb,
  refetchSources,
  refetchConnections,
}: {
  webId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refetchWeb: () => void;
  refetchSources: () => void;
  refetchConnections: () => void;
}) {
  const {
    data: processes,
    refetch: refetchProcesses,

    isError,
    error,
  } = useFetchAllProcesses(webId);

  const [availableProcesses, setAvailableProcesses] = useState<Process[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isOpen) {
      intervalId = setInterval(() => {
        refetchProcesses();
      }, 1000); // refresh every 1 second
    }
    if (processes) {
      setAvailableProcesses(processes);
      const connectedProcesses = availableProcesses.filter(
        (process) =>
          process.type === "connect" && process.status === "completed"
      );
      const closeModalFlag = availableProcesses.some(
        (process) => process.closeModal === true
      );
      if (closeModalFlag) {
        refetchSources();
        refetchConnections();
        refetchWeb();
        setTimeout(() => onOpenChange(false), 2000);
      }
    }
    // if there exists a 'connect' process that is completed, refetch connections
    if (processes) {
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isOpen,
    refetchProcesses,
    processes,
    onOpenChange,
    refetchWeb,
    availableProcesses,
  ]);

  const renderProcessStatus = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    return (
      <Badge variant={config.color as any}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Progress</DialogTitle>
          <DialogDescription>View progresses for this web</DialogDescription>
        </DialogHeader>

        {availableProcesses.length === 0 ? (
          <Loader2 className="animate-spin" />
        ) : isError ? (
          <div className="text-destructive text-center">
            Error loading processes: {error?.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableProcesses.map((process: Process) => (
                <TableRow key={process.jobId}>
                  <TableCell>{process.description}</TableCell>
                  <TableCell>{renderProcessStatus(process.status)}</TableCell>
                  <TableCell>
                    <Progress value={process.percentage} className="w-32" />
                  </TableCell>
                  <TableCell>
                    {new Date(process.created).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProcessModal;
