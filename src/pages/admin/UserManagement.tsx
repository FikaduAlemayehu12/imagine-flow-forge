import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import UserRoleManager from "@/components/UserRoleManager";

const UserManagement = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage user accounts and role assignments
            </p>
          </div>
        </div>

        {/* User Role Manager */}
        <UserRoleManager />
      </div>
    </Layout>
  );
};

export default UserManagement;
