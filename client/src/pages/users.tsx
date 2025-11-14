import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import type { User, Department, Role } from "@shared/schema";
import { useForm } from "react-hook-form";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: number;
  gmId?: number;
}

export default function Users() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: gms = [] } = useQuery<User[]>({
    queryKey: ["/api/users/gms"],
  });

  const form = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "AM",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`, {});
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/users"] });
      const previousUsers = queryClient.getQueryData<User[]>(["/api/users"]);
      
      queryClient.setQueryData<User[]>(["/api/users"], (old) => 
        old?.filter(u => u.id !== deletedId) || []
      );
      
      return { previousUsers };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(["/api/users"], context?.previousUsers);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const handleSubmit = (data: UserFormData) => {
    createMutation.mutate(data);
  };

  const getRoleBadgeVariant = (role: Role) => {
    if (role === "ADMIN") return "default";
    if (role === "GM") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-users-title">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users and their roles
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-user">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  required
                  data-testid="input-user-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  required
                  data-testid="input-user-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  required
                  data-testid="input-user-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) => form.setValue("role", value as Role)}
                >
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === "ADMIN" && (
                      <>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="GM">GM</SelectItem>
                      </>
                    )}
                    <SelectItem value="AM">AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(form.watch("role") === "GM" || form.watch("role") === "AM") && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={form.watch("departmentId")?.toString()}
                    onValueChange={(value) => form.setValue("departmentId", parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.watch("role") === "AM" && (
                <div className="space-y-2">
                  <Label htmlFor="gm">Reporting GM</Label>
                  <Select
                    value={form.watch("gmId")?.toString()}
                    onValueChange={(value) => form.setValue("gmId", parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-gm">
                      <SelectValue placeholder="Select GM" />
                    </SelectTrigger>
                    <SelectContent>
                      {gms.map((gm) => (
                        <SelectItem key={gm.id} value={gm.id.toString()}>
                          {gm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-user">
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.departmentId || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending || user.id === currentUser?.id}
                        data-testid={`button-delete-user-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
