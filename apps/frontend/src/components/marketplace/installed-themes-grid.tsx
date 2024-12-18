'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, Trash2, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function InstalledThemesGrid() {
  const { currentTheme, uninstallTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleTheme = async (enabled: boolean) => {
    try {
      if (currentTheme) {
        await toggleTheme(enabled);
        toast({
          title: enabled ? "Theme enabled" : "Theme disabled",
          description: enabled ? "Your theme has been enabled" : "Your theme has been disabled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle theme",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTheme = async () => {
    try {
      await uninstallTheme();
      toast({
        title: "Theme removed",
        description: "Your theme has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove theme",
        variant: "destructive",
      });
    }
  };

  if (!currentTheme) {
    return (
      <Card className="col-span-full p-6 bg-muted/50">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <Paintbrush className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="font-medium">No themes installed</h3>
            <p className="text-sm text-muted-foreground">
              Browse the marketplace to find and install themes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/marketplace')}
            className="mt-2"
          >
            Browse Themes
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card key={currentTheme.id} className={cn(
        "group relative overflow-hidden transition-all",
        "hover:shadow-lg hover:border-primary/50",
        currentTheme.enabled ? "border-primary/50" : ""
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-primary" />
                {currentTheme.name}
              </CardTitle>
              <CardDescription>
                {currentTheme.description || "No description available"}
              </CardDescription>
            </div>
            <Switch
              checked={currentTheme.enabled !== false}
              onCheckedChange={handleToggleTheme}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Version</span>
                <span>{currentTheme.version || "1.0.0"}</span>
              </div>
              {currentTheme.metadata?.author && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Author</span>
                  <span>{currentTheme.metadata.author}</span>
                </div>
              )}
            </div>
            
            {currentTheme.metadata?.tags && (
              <div className="flex flex-wrap gap-2">
                {currentTheme.metadata.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemoveTheme}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
