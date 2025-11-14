import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Clock, Paperclip } from "lucide-react";
import type { Customer, Progress, CustomerStatus } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/currency";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
}

interface ProgressFormData {
  date: string;
  note: string;
  status: CustomerStatus;
  file?: FileList;
}

export function CustomerDetail({ customer, onClose }: CustomerDetailProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: progresses = [], isLoading } = useQuery<Progress[]>({
    queryKey: ["/api/customers", customer.id, "progresses"],
  });

  const form = useForm<ProgressFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      note: "",
      status: customer.status,
    },
  });

  const createProgressMutation = useMutation({
    mutationFn: async (data: ProgressFormData) => {
      let fileUrl = null;
      
      if (data.file && data.file.length > 0) {
        const formData = new FormData();
        formData.append("file", data.file[0]);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.fileUrl;
        }
      }
      
      const { file, ...progressData } = data;
      return await apiRequest("POST", `/api/customers/${customer.id}/progresses`, {
        ...progressData,
        fileUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "progresses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Progress logged",
        description: "Activity has been logged successfully",
      });
    },
  });

  const handleSubmit = (data: ProgressFormData) => {
    createProgressMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold" data-testid="text-customer-detail-title">
            {customer.companyName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Customer details and progress timeline
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-progress">
              <Plus className="mr-2 h-4 w-4" />
              Log Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
              <DialogDescription>
                Add a new activity or update for this customer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                  required
                  data-testid="input-progress-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Activity Description</Label>
                <Textarea
                  id="note"
                  {...form.register("note")}
                  placeholder="Describe the activity or progress..."
                  rows={4}
                  required
                  data-testid="input-progress-note"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as CustomerStatus)}
                >
                  <SelectTrigger data-testid="select-progress-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="On Going">On Going</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                    <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Attachment (optional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  {...form.register("file")}
                  data-testid="input-progress-file"
                />
                <p className="text-xs text-muted-foreground">
                  Max 5MB. Accepted: images, PDF, DOC, XLS
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createProgressMutation.isPending}
                  data-testid="button-submit-progress"
                >
                  {createProgressMutation.isPending ? "Logging..." : "Log Progress"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{customer.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Person in Charge</p>
              <p className="font-medium">{customer.pic}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{customer.contact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Potential Amount</p>
              <p className="text-lg font-bold text-primary">
                {formatRupiah(customer.potentialRp)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Close Date</p>
              <p className="font-medium">
                {customer.estCloseDate 
                  ? format(new Date(customer.estCloseDate), "dd MMM yyyy")
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Status</p>
              <StatusBadge status={customer.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Progress Timeline
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading timeline...</p>
            ) : progresses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No progress logged yet. Add your first activity to track this customer.
              </p>
            ) : (
              <div className="space-y-4">
                {progresses.map((progress, index) => (
                  <div
                    key={progress.id}
                    className="relative pl-6 pb-4 border-l-2 border-border last:border-l-0"
                    data-testid={`progress-item-${progress.id}`}
                  >
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background"></div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {format(new Date(progress.date), "dd MMM yyyy")}
                        </p>
                        <StatusBadge status={progress.status} className="text-xs" />
                      </div>
                      <p className="text-sm text-muted-foreground">{progress.note}</p>
                      {progress.fileUrl && (
                        <a
                          href={progress.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline mt-2"
                        >
                          <Paperclip className="h-3 w-3" />
                          View attachment
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
