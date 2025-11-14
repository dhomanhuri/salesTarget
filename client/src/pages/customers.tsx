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
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import type { Customer, CustomerStatus } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/currency";
import { useForm } from "react-hook-form";
import { CustomerDetail } from "@/components/customer-detail";

interface CustomerFormData {
  companyName: string;
  pic: string;
  contact: string;
  potentialRp: string;
  estCloseDate: string;
  status: CustomerStatus;
}

export default function Customers() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<CustomerFormData>({
    defaultValues: {
      companyName: "",
      pic: "",
      contact: "",
      potentialRp: "",
      estCloseDate: "",
      status: "Prospect",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return await apiRequest("POST", "/api/customers", {
        ...data,
        potentialRp: parseFloat(data.potentialRp.replace(/[^0-9]/g, "")),
      });
    },
    onSuccess: (newCustomer) => {
      queryClient.setQueryData<Customer[]>(["/api/customers"], (old) => 
        old ? [...old, newCustomer] : [newCustomer]
      );
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Customer created",
        description: "New customer has been added successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerFormData }) => {
      return await apiRequest("PUT", `/api/customers/${id}`, {
        ...data,
        potentialRp: parseFloat(data.potentialRp.replace(/[^0-9]/g, "")),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setEditingCustomer(null);
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/customers/${id}`, {});
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/customers"] });
      const previousCustomers = queryClient.getQueryData<Customer[]>(["/api/customers"]);
      
      queryClient.setQueryData<Customer[]>(["/api/customers"], (old) => 
        old?.filter(c => c.id !== deletedId) || []
      );
      
      return { previousCustomers };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(["/api/customers"], context?.previousCustomers);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      companyName: customer.companyName,
      pic: customer.pic,
      contact: customer.contact,
      potentialRp: customer.potentialRp.toString(),
      estCloseDate: customer.estCloseDate || "",
      status: customer.status,
    });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    form.reset();
    setDialogOpen(true);
  };

  if (viewingCustomer) {
    return (
      <CustomerDetail
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-customers-title">
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer pipeline and prospects
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} data-testid="button-add-customer">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer information" : "Add a new customer to your pipeline"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...form.register("companyName")}
                    required
                    data-testid="input-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pic">Person in Charge (PIC)</Label>
                  <Input
                    id="pic"
                    {...form.register("pic")}
                    required
                    data-testid="input-pic"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    {...form.register("contact")}
                    placeholder="Email or phone"
                    required
                    data-testid="input-contact"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="potentialRp">Potential Amount (Rp)</Label>
                  <Input
                    id="potentialRp"
                    type="text"
                    placeholder="1000000"
                    {...form.register("potentialRp")}
                    required
                    data-testid="input-potential"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estCloseDate">Estimated Close Date</Label>
                  <Input
                    id="estCloseDate"
                    type="date"
                    {...form.register("estCloseDate")}
                    data-testid="input-close-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value as CustomerStatus)}
                  >
                    <SelectTrigger data-testid="select-status">
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
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-customer"
                >
                  {(createMutation.isPending || updateMutation.isPending)
                    ? "Saving..."
                    : editingCustomer
                    ? "Update Customer"
                    : "Create Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Potential</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found. Add your first customer to get started.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                    <TableCell className="font-medium">{customer.companyName}</TableCell>
                    <TableCell>{customer.pic}</TableCell>
                    <TableCell>{customer.contact}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(customer.potentialRp)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingCustomer(customer)}
                          data-testid={`button-view-customer-${customer.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(customer)}
                          data-testid={`button-edit-customer-${customer.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(customer.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-customer-${customer.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
