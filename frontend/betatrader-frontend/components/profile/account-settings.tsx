"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getAccountData } from "@/lib/api-helpers"

const card = "bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl"
const field = "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mt-2 shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none"

export default function AccountSettings() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: "", email: "", phone: "", currency: "usd", leverage: "1:100", notifications: true, alerts: true,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getAccountData()
        setFormData((prev) => ({
          ...prev,
          username: data.user.username || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
        }))
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleSave = async () => console.log("Saving settings:", formData)

  if (loading) {
    return (
      <Card className={card}><CardContent className="pt-6"><div className="h-40 bg-slate-100 dark:bg-white/10 rounded-lg animate-pulse" /></CardContent></Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className={card}>
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={field} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={field} />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={field} />
          </div>
          <Button onClick={handleSave} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className={card}>
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Trading Preferences</CardTitle>
          <CardDescription>Customize your trading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Base Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger className={field}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                <SelectItem value="usd">USD - US Dollar</SelectItem>
                <SelectItem value="eur">EUR - Euro</SelectItem>
                <SelectItem value="gbp">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default Leverage</Label>
            <Select value={formData.leverage} onValueChange={(value) => setFormData({ ...formData, leverage: value })}>
              <SelectTrigger className={field}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                <SelectItem value="1:50">1:50</SelectItem>
                <SelectItem value="1:100">1:100</SelectItem>
                <SelectItem value="1:200">1:200</SelectItem>
                <SelectItem value="1:500">1:500</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label>Trade Notifications</Label>
            <Switch checked={formData.notifications} onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Price Alerts</Label>
            <Switch checked={formData.alerts} onCheckedChange={(checked) => setFormData({ ...formData, alerts: checked })} />
          </div>
          <Button onClick={handleSave} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}
