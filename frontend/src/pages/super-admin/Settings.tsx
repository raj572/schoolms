import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, DollarSign, Clock, Save, ShieldCheck, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminSettings() {
  const { toast } = useToast();
  
  const [language, setLanguage] = useState(() => localStorage.getItem('sa_language') || 'en');
  const [currency, setCurrency] = useState(() => localStorage.getItem('sa_currency') || 'INR');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('sa_timezone') || 'Asia/Kolkata');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('sa_theme') || 'system');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('sa_language', language);
      localStorage.setItem('sa_currency', currency);
      localStorage.setItem('sa_timezone', timezone);
      localStorage.setItem('sa_theme', themeMode);

      toast({
        title: 'Settings Saved',
        description: 'System configuration updated successfully.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform localization, currency, and operational preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & Regional Settings */}
        <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Globe className="w-5 h-5 text-primary" />
              Language & Locale
            </CardTitle>
            <CardDescription>Select primary system display language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Default Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="es">Spanish (Español)</SelectItem>
                  <SelectItem value="fr">French (Français)</SelectItem>
                  <SelectItem value="ar">Arabic (العربية)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Financials */}
        <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Currency & Billing
            </CardTitle>
            <CardDescription>Default currency symbol for invoices & revenue analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">System Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Timezone Configuration */}
        <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Clock className="w-5 h-5 text-indigo-500" />
              Timezone & Clock
            </CardTitle>
            <CardDescription>System logs, subscriptions, and transaction timestamping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">(UTC+05:30) India Standard Time (IST)</SelectItem>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">(UTC-05:00) Eastern Time (US & Canada)</SelectItem>
                  <SelectItem value="Europe/London">(UTC+00:00) Greenwich Mean Time (GMT)</SelectItem>
                  <SelectItem value="Asia/Dubai">(UTC+04:00) Gulf Standard Time (GST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security & System Info */}
        <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Environment & Security
            </CardTitle>
            <CardDescription>Global platform environment parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-semibold text-foreground">v2.4.0-stable</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Environment</span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 font-medium">Production</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">API SSL Standard</span>
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600 font-medium">TLS v1.3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
