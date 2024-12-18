'use client';

import { ChevronDown, ChevronUp, Moon, Sun, Laptop } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme as useNextTheme } from "next-themes";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface ThemeSection {
  name: string;
  variables: { [key: string]: string };
}

export function ThemeSettingsCard() {
  const { theme, setTheme } = useNextTheme();
  const { currentTheme, uninstallTheme, toggleTheme, toggleThemeVariable } = useTheme();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

  const handleToggleVariable = async (section: string, key: string, enabled: boolean) => {
    try {
      await toggleThemeVariable(`${section}.${key}`, enabled);
      toast({
        title: enabled ? "Variable enabled" : "Variable disabled",
        description: `Theme variable "${key}" has been ${enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle theme variable",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderThemeSection = (section: string, variables: { [key: string]: string }) => {
    const isExpanded = expandedSections.includes(section);
    const disabledVariables = currentTheme?.customization?.disabledVariables || [];

    return (
      <div key={section} className="border rounded-lg p-4 space-y-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection(section)}
        >
          <Label className="text-sm font-medium capitalize">{section}</Label>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        
        {isExpanded && (
          <div className="space-y-3 mt-2">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm">{key}</Label>
                  <p className="text-xs text-muted-foreground">{value}</p>
                </div>
                <Switch
                  checked={!disabledVariables.includes(`${section}.${key}`)}
                  onCheckedChange={(checked) => handleToggleVariable(section, key, checked)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
          <CardTitle>Theme Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* System Theme Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => 
                setTheme(checked ? 'dark' : 'light')
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Theme</Label>
              <p className="text-sm text-muted-foreground">
                Use your system's theme preference
              </p>
            </div>
            <Switch
              checked={theme === 'system'}
              onCheckedChange={(checked) => 
                setTheme(checked ? 'system' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
              }
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Marketplace Theme</span>
          </div>
        </div>

        {/* Marketplace Theme Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Current Theme</Label>
              <p className="text-sm text-muted-foreground">
                {currentTheme ? currentTheme.name : "No theme installed"}
              </p>
            </div>
            {currentTheme && (
              <Switch
                checked={currentTheme.enabled !== false}
                onCheckedChange={handleToggleTheme}
              />
            )}
          </div>
          
          {currentTheme && (
            <div className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Version</span>
                  <span>{currentTheme.version || "1.0.0"}</span>
                </div>
                {currentTheme.metadata?.author && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground">Author</span>
                    <span>{currentTheme.metadata.author}</span>
                  </div>
                )}
                {currentTheme.metadata?.tags && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground">Tags</span>
                    <span className="flex gap-1">
                      {currentTheme.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {currentTheme.variables && Object.entries(currentTheme.variables).map(([section, variables]) => 
                  renderThemeSection(section, variables)
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={handleRemoveTheme}
              >
                Remove Theme
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
