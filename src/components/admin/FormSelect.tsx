"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

const ALL_SENTINEL = "__all__";

export function FormSelect({
  name,
  defaultValue = "",
  placeholder,
  options,
  triggerClassName,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  options: Option[];
  triggerClassName?: string;
}) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue === "" ? ALL_SENTINEL : defaultValue}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value === "" ? ALL_SENTINEL : opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}