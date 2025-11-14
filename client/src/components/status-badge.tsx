import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

const statusConfig: Record<CustomerStatus, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  "Prospect": {
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  "On Going": {
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  "Negotiation": {
    variant: "secondary",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  "Closed Won": {
    variant: "secondary",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  "Closed Lost": {
    variant: "secondary",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {status}
    </Badge>
  );
}
