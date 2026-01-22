import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { AdminsManagement } from "@/components/admin/AdminsManagement";
import { LeadsAdmin } from "@/components/admin/LeadsAdmin";
import { ModulesAdmin } from "@/components/admin/ModulesAdmin";
import { ModuleCardsAdmin } from "@/components/admin/ModuleCardsAdmin";
import { LibraryAdmin } from "@/components/admin/LibraryAdmin";
import { AdminSettingsContent } from "@/components/admin/AdminSettingsContent";
import { FinanceAdmin } from "@/components/admin/FinanceAdmin";
import { EmailAdmin } from "@/components/admin/EmailAdmin";
import { ModulePdfsAdmin } from "@/components/admin/ModulePdfsAdmin";
import { AbandonedCartDashboard } from "@/components/admin/AbandonedCartDashboard";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="dashboard" className="mt-0">
          <AdminDashboard />
        </TabsContent>
        <TabsContent value="users" className="mt-0">
          <UsersAdmin />
        </TabsContent>
        <TabsContent value="admins" className="mt-0">
          <AdminsManagement />
        </TabsContent>
        <TabsContent value="leads" className="mt-0">
          <LeadsAdmin />
        </TabsContent>
        <TabsContent value="finance" className="mt-0">
          <FinanceAdmin />
        </TabsContent>
        <TabsContent value="email" className="mt-0">
          <EmailAdmin />
        </TabsContent>
        <TabsContent value="abandoned-cart" className="mt-0">
          <AbandonedCartDashboard />
        </TabsContent>
        <TabsContent value="modules" className="mt-0">
          <ModulesAdmin />
        </TabsContent>
        <TabsContent value="cards" className="mt-0">
          <ModuleCardsAdmin />
        </TabsContent>
        <TabsContent value="pdfs" className="mt-0">
          <ModulePdfsAdmin />
        </TabsContent>
        <TabsContent value="library" className="mt-0">
          <LibraryAdmin />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <AdminSettingsContent onTabChange={setActiveTab} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
