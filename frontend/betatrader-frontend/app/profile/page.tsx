"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/profile/profile-header";
import AccountSwitcher from "@/components/profile/account-switcher";
import TradingStats from "@/components/profile/trading-stats";
import AccountSettings from "@/components/profile/account-settings";
import SecuritySettings from "@/components/profile/security-settings";
import ReferralSection from "@/components/profile/referral-section";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="relative min-h-screen text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AccountSwitcher />
          </div>
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 rounded-2xl
                bg-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
                dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
                <TabsTrigger value="overview" className="rounded-xl
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
                  data-[state=active]:shadow-[3px_3px_8px_#0891b2] dark:data-[state=active]:shadow-none">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
                  data-[state=active]:shadow-[3px_3px_8px_#0891b2] dark:data-[state=active]:shadow-none">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-xl
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
                  data-[state=active]:shadow-[3px_3px_8px_#0891b2] dark:data-[state=active]:shadow-none">
                  Security
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <TradingStats />
                <ReferralSection />
              </TabsContent>
              <TabsContent value="settings" className="space-y-6 mt-6">
                <AccountSettings />
              </TabsContent>
              <TabsContent value="security" className="space-y-6 mt-6">
                <SecuritySettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
