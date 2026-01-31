import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Info, FileQuestion, Lock, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface InfoPage {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  isActive: boolean | null;
}

export default function AdminInfoPages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const pageSlug = location.split("/").pop() || "about";
  
  const { data: pages } = useQuery<InfoPage[]>({
    queryKey: ["/api/pages"]
  });

  const currentPage = pages?.find(p => p.slug === pageSlug);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title || "");
      setContent(currentPage.content || "");
      setIsActive(currentPage.isActive ?? true);
    } else {
      const defaults: Record<string, string> = {
        about: "About Us",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy"
      };
      setTitle(defaults[pageSlug] || "");
      setContent("");
      setIsActive(true);
    }
  }, [currentPage, pageSlug]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/pages", { slug: pageSlug, title, content, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Page saved successfully" });
    }
  });

  if (!(user as any)?.isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const icons: Record<string, any> = {
    about: Info,
    terms: FileQuestion,
    privacy: Lock
  };

  const labels: Record<string, string> = {
    about: "About Us",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy"
  };

  const Icon = icons[pageSlug] || Info;

  return (
    <AdminLayout>
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="text-zinc-400 hover:text-white mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{labels[pageSlug]}</h1>
          <p className="text-muted-foreground">Edit the {labels[pageSlug].toLowerCase()} page content</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Page Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              data-testid={`input-page-${pageSlug}-title`}
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your page content here..."
              className="min-h-[300px]"
              data-testid={`input-page-${pageSlug}-content`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can use plain text or basic HTML for formatting
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label>Page Enabled</Label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              data-testid={`switch-page-${pageSlug}-active`}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid={`button-save-page-${pageSlug}`}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Page
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
