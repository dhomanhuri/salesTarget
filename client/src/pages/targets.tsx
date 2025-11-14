import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Target as TargetIcon, Plus } from "lucide-react";
import type { User, Target } from "@shared/schema";
import { formatRupiah } from "@/lib/currency";
import { useForm } from "react-hook-form";

interface TargetFormData {
  userId: number;
  period: string;
  amountRp: string;
}

export default function Targets() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: targets = [], isLoading } = useQuery<(Target & { userName: string })[]>({
    queryKey: ["/api/targets"],
  });

  const { data: ams = [] } = useQuery<User[]>({
    queryKey: ["/api/users/ams"],
    enabled: currentUser?.role === "ADMIN" || currentUser?.role === "GM",
  });

  const form = useForm<TargetFormData>({
    defaultValues: {
      period: new Date().toISOString().slice(0, 7),
      amountRp: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TargetFormData) => {
      return await apiRequest("POST", "/api/targets", {
        ...data,
        amountRp: parseFloat(data.amountRp.replace(/[^0-9]/g, "")),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Target set",
        description: "Sales target has been set successfully",
      });
    },
  });

  const handleSubmit = (data: TargetFormData) => {
    createMutation.mutate(data);
  };

  const canSetTargets = currentUser?.role === "ADMIN" || currentUser?.role === "GM";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-targets-title">
            Target Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {canSetTargets ? "Set and manage sales targets" : "View your sales targets"}
          </p>
        </div>
        {canSetTargets && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-target">
                <Plus className="mr-2 h-4 w-4" />
                Set Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Set Sales Target</DialogTitle>
                <DialogDescription>
                  Set a monthly sales target for an account manager
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Account Manager</Label>
                  <Select
                    value={form.watch("userId")?.toString()}
                    onValueChange={(value) => form.setValue("userId", parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-am">
                      <SelectValue placeholder="Select AM" />
                    </SelectTrigger>
                    <SelectContent>
                      {ams.map((am) => (
                        <SelectItem key={am.id} value={am.id.toString()}>
                          {am.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period (YYYY-MM)</Label>
                  <Input
                    id="period"
                    type="month"
                    {...form.register("period")}
                    required
                    data-testid="input-period"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountRp">Target Amount (Rp)</Label>
                  <Input
                    id="amountRp"
                    type="text"
                    placeholder="1000000"
                    {...form.register("amountRp")}
                    required
                    data-testid="input-amount"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-target">
                    {createMutation.isPending ? "Setting..." : "Set Target"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Sales Targets
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Manager</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Target Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Loading targets...
                  </TableCell>
                </TableRow>
              ) : targets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No targets found
                  </TableCell>
                </TableRow>
              ) : (
                targets.map((target) => (
                  <TableRow key={target.id} data-testid={`row-target-${target.id}`}>
                    <TableCell className="font-medium">{target.userName}</TableCell>
                    <TableCell>{target.period}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(target.amountRp)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
