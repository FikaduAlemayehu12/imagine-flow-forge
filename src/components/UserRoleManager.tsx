import { useState } from "react";
import { Users, Shield, UserCheck, UserX, Loader2, Search, UserPlus, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllUsersWithRoles, useAssignRole, useRemoveRole, AppRole, UserWithRole } from "@/hooks/useAdminRoles";
import { useBranches } from "@/hooks/useBranches";
import { roleConfig } from "@/hooks/useUserRole";
import { format } from "date-fns";
import CreateStaffAccountDialog from "@/components/admin/CreateStaffAccountDialog";
import { Label } from "@/components/ui/label";

const allRoles: AppRole[] = ["taxpayer", "officer", "supervisor", "risk_analyst", "auditor", "admin", "super_admin", "branch_staff"];

const UserRoleManager = () => {
  const { data: users = [], isLoading } = useAllUsersWithRoles();
  const { data: branches = [] } = useBranches();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignRole = () => {
    if (selectedUser && selectedRole) {
      assignRole.mutate(
        { userId: selectedUser.id, role: selectedRole as AppRole, branchId: selectedBranchId || undefined },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setSelectedUser(null);
            setSelectedRole("");
            setSelectedBranchId("");
          },
        }
      );
    }
  };

  const handleRemoveRole = () => {
    if (selectedUser) {
      removeRole.mutate(selectedUser.id, {
        onSuccess: () => {
          setConfirmRemove(false);
          setSelectedUser(null);
        },
      });
    }
  };

  const openAssignDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRole(user.role || "");
    setSelectedBranchId(user.branch_id || "");
    setDialogOpen(true);
  };

  const openRemoveConfirm = (user: UserWithRole) => {
    setSelectedUser(user);
    setConfirmRemove(true);
  };

  const getRoleBadge = (role: AppRole | null) => {
    if (!role) {
      return <Badge variant="outline" className="text-muted-foreground">No Role</Badge>;
    }
    const config = roleConfig[role];
    return (
      <Badge className={`${config.bgColor} ${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                User Role Management
              </CardTitle>
              <CardDescription>Assign and manage user roles for access control</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Staff Account
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.branch_id ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {branches.find(b => b.id === user.branch_id)?.branch_name || "Unknown"}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDialog(user)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {user.role ? "Change" : "Assign"}
                          </Button>
                          {user.role && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openRemoveConfirm(user)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Select a role and optionally a branch to assign to {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${roleConfig[role].bgColor}`} />
                      {roleConfig[role].label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
            {/* Branch selection for branch_staff or officer */}
            {(selectedRole === "branch_staff" || selectedRole === "officer") && (
              <div className="space-y-2">
                <Label>Assign to Branch {selectedRole === "branch_staff" ? "*" : "(Optional)"}</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No branch</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.branch_name} ({branch.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole} 
            disabled={!selectedRole || assignRole.isPending || (selectedRole === "branch_staff" && !selectedBranchId)}
            >
              {assignRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the role from {selectedUser?.full_name}? 
              They will lose all associated permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveRole}
              disabled={removeRole.isPending}
            >
              {removeRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Staff Account Dialog */}
      <CreateStaffAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};

export default UserRoleManager;
