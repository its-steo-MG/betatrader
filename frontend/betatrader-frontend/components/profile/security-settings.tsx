"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, Smartphone } from "lucide-react"

const card = "bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl"
const field = "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mt-2 shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none"
const row = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className={card}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white"><Lock className="w-5 h-5" /> Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" className={field} /></div>
          <div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" className={field} /></div>
          <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" className={field} /></div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">Update Password</Button>
        </CardContent>
      </Card>

      <Card className={card}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white"><Smartphone className="w-5 h-5" /> Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-lg border ${row}`}>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Authenticator App</p>
              <p className="text-sm text-slate-500 dark:text-white/50">Use an app like Google Authenticator</p>
            </div>
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">Disabled</Badge>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">Enable 2FA</Button>
        </CardContent>
      </Card>

      <Card className={card}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white"><Shield className="w-5 h-5" /> Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { device: "Chrome on Windows", location: "New York, USA", lastActive: "2 minutes ago", current: true },
            { device: "Safari on iPhone", location: "New York, USA", lastActive: "1 hour ago", current: false },
            { device: "Chrome on MacBook", location: "San Francisco, USA", lastActive: "3 days ago", current: false },
          ].map((session, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${row}`}>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{session.device}</p>
                <p className="text-sm text-slate-500 dark:text-white/50">{session.location} • {session.lastActive}</p>
              </div>
              <div className="flex items-center gap-2">
                {session.current && <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">Current</Badge>}
                <Button variant="ghost" size="sm" className="text-rose-500">Logout</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
