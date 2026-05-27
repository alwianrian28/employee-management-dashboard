"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  KARYAWAN_ROLE_OPTIONS,
  type KaryawanFilterRole,
} from "@/components/karyawan/KaryawanRoleBadge";

type KaryawanFilterBarProps = {
  qInput: string;
  businessUnitInput: string;
  departemenInput: string;
  jobTitleInput: string;
  roleInput: KaryawanFilterRole;
  activeOnlyInput: boolean;
  onQChange: (value: string) => void;
  onBusinessUnitChange: (value: string) => void;
  onDepartemenChange: (value: string) => void;
  onJobTitleChange: (value: string) => void;
  onRoleChange: (value: KaryawanFilterRole) => void;
  onActiveOnlyChange: (value: boolean) => void;
  onApply: () => void;
  onReset: () => void;
};

export function KaryawanFilterBar({
  qInput,
  businessUnitInput,
  departemenInput,
  jobTitleInput,
  roleInput,
  activeOnlyInput,
  onQChange,
  onBusinessUnitChange,
  onDepartemenChange,
  onJobTitleChange,
  onRoleChange,
  onActiveOnlyChange,
  onApply,
  onReset,
}: KaryawanFilterBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filter Karyawan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input
            placeholder="Cari nama/NIK/email..."
            value={qInput}
            onChange={(e) => onQChange(e.target.value)}
            aria-label="Cari karyawan"
            className="md:col-span-2"
          />
          <Input
            placeholder="Business Unit"
            value={businessUnitInput}
            onChange={(e) => onBusinessUnitChange(e.target.value)}
            aria-label="Filter business unit"
          />
          <Input
            placeholder="Department"
            value={departemenInput}
            onChange={(e) => onDepartemenChange(e.target.value)}
            aria-label="Filter departemen"
          />
          <Input
            placeholder="Job title"
            value={jobTitleInput}
            onChange={(e) => onJobTitleChange(e.target.value)}
            aria-label="Filter job title"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {KARYAWAN_ROLE_OPTIONS.map((opt) => {
            const active = roleInput === opt.value;
            return (
              <Button
                key={opt.value}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => onRoleChange(opt.value)}
                aria-pressed={active}
              >
                {opt.label}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant={activeOnlyInput ? "default" : "outline"}
            onClick={() => onActiveOnlyChange(!activeOnlyInput)}
            aria-pressed={activeOnlyInput}
          >
            Active only
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={onApply} aria-label="Terapkan filter karyawan">
            <Search className="mr-2 h-4 w-4" />
            Apply
          </Button>
          <Button variant="outline" onClick={onReset} aria-label="Reset filter karyawan">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
