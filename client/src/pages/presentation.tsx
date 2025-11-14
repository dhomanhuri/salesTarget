import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/currency";
import type { Customer, Progress } from "@shared/schema";
import { format } from "date-fns";
import { Clock, Building2, User, Phone, Calendar, DollarSign } from "lucide-react";

export default function Presentation() {
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  if (customersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold" data-testid="text-presentation-title">
            Customer Pipeline Presentation
          </h1>
          <p className="text-xl text-muted-foreground">
            Current Status & Progress Overview
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {customers.map((customer) => (
            <CustomerPresentationCard key={customer.id} customer={customer} />
          ))}
        </div>

        {customers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-muted-foreground">
              No customers to display
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerPresentationCard({ customer }: { customer: Customer }) {
  const { data: progresses = [] } = useQuery<Progress[]>({
    queryKey: ["/api/customers", customer.id, "progresses"],
  });

  return (
    <Card className="hover-elevate" data-testid={`card-customer-${customer.id}`}>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h2 className="text-2xl font-bold">{customer.companyName}</h2>
              <StatusBadge status={customer.status} className="text-sm px-4 py-1" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-base">
              <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">PIC:</span>
              <span className="font-medium">{customer.pic}</span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{customer.contact}</span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Potential:</span>
              <span className="font-bold text-primary text-lg">
                {formatRupiah(customer.potentialRp)}
              </span>
            </div>
            {customer.estCloseDate && (
              <div className="flex items-center gap-3 text-base">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Est. Close:</span>
                <span className="font-medium">
                  {format(new Date(customer.estCloseDate), "dd MMM yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>

        {progresses.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Recent Activity
            </div>
            <div className="space-y-3">
              {progresses.slice(0, 3).map((progress) => (
                <div
                  key={progress.id}
                  className="pl-4 border-l-2 border-primary/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {format(new Date(progress.date), "dd MMM yyyy")}
                    </p>
                    <StatusBadge status={progress.status} className="text-xs" />
                  </div>
                  <p className="text-base">{progress.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
