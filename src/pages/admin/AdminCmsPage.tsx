import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminCmsEditor from "@/components/AdminCmsEditor";
import CmsBlogManager from "@/components/admin/CmsBlogManager";
import CmsVersionHistory from "@/components/admin/CmsVersionHistory";
import SectionVisibilityManager from "@/components/admin/SectionVisibilityManager";

export default function AdminCmsPage() {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">Content Management System</h2>
      <Tabs defaultValue="pages">
        <TabsList className="mb-4">
          <TabsTrigger value="pages">Site Content</TabsTrigger>
          <TabsTrigger value="visibility">Section Visibility</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>
        <TabsContent value="pages">
          <AdminCmsEditor />
        </TabsContent>
        <TabsContent value="visibility">
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-lg font-bold">Website Section Visibility</h3>
              <p className="text-xs text-muted-foreground mt-1">Enable or disable frontend sections. Disabled sections will be hidden from the public website.</p>
            </div>
            <SectionVisibilityManager />
          </div>
        </TabsContent>
        <TabsContent value="blog">
          <CmsBlogManager />
        </TabsContent>
        <TabsContent value="history">
          <CmsVersionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
