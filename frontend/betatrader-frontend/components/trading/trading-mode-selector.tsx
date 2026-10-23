"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRobot {
  id: number;
  robot: {
    id: number;
    name: string;
    available_for_demo?: boolean;
    is_elite_robot?: boolean;
    is_s_digit_robot?: boolean;
    is_bulk_robot?: boolean;
  };
  purchased_at: string | null;
  is_used?: boolean;
  is_setting?: boolean;
}

interface TradingModeSelectorProps {
  onModeChange: (mode: "manual" | "robot") => void;
  selectedRobot: number | null;
  onRobotSelect: (robotId: number | null) => void;
  userRobots: UserRobot[];
}

export function TradingModeSelector({ onModeChange, selectedRobot, onRobotSelect, userRobots }: TradingModeSelectorProps) {
  const [mode, setMode] = useState<"manual" | "robot">("manual");
  const [loginType, setLoginType] = useState<"real" | "demo">("real");

  useEffect(() => {
    const stored = localStorage.getItem("login_type");
    setLoginType((stored === "demo" ? "demo" : "real") as "real" | "demo");
  }, []);

  const visibleRobots = userRobots.filter((ur) => {
    if (ur.robot.is_s_digit_robot || ur.robot.is_bulk_robot) return false;
    if (loginType === "real") return ur.purchased_at !== null;
    return true;
  });

  const handleModeChange = (value: "manual" | "robot") => {
    setMode(value);
    onModeChange(value);
    if (value === "manual") onRobotSelect(null);
  };

  const selectClass = "w-full bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white h-11 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-none";

  return (
    <div className="space-y-4 w-full">
      <div>
        <label className="text-xs text-slate-500 dark:text-white/50 mb-1 block">Trading Mode</label>
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="robot">Robot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "robot" && (
        <div>
          <label className="text-xs text-slate-500 dark:text-white/50 mb-1 block">Select Robot</label>
          {visibleRobots.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-white/50">
              {loginType === "demo" ? "No demo robots available" : "No robots purchased yet"}
            </p>
          ) : (
            <Select value={selectedRobot?.toString() ?? ""} onValueChange={(v) => onRobotSelect(v ? Number(v) : null)}>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select a robot" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                {visibleRobots.map((ur) => (
                  <SelectItem key={ur.robot.id} value={ur.robot.id.toString()}>
                    {ur.robot.name}
                    {ur.robot.is_elite_robot && <span className="ml-2 text-xs text-amber-500">(Elite)</span>}
                    {ur.purchased_at === null && loginType === "demo" && <span className="ml-2 text-xs text-cyan-500">(Demo)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
