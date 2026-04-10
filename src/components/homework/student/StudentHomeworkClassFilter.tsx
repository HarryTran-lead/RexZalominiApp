import React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

interface StudentHomeworkClassFilterProps {
  classes: string[];
  value: string;
  onChange: (value: string) => void;
}

const StudentHomeworkClassFilter: React.FC<StudentHomeworkClassFilterProps> = ({
  classes,
  value,
  onChange,
}) => {
  const selectedClassLabel = classes.find((className) => className === value) ?? "Tất cả lớp";

  return (
    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
      <label className="mb-1 block text-xs font-semibold text-gray-500">Lọc theo lớp</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 outline-none focus:border-red-400">
            <span className="block truncate">{selectedClassLabel}</span>
            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
          </ListboxButton>
          <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            <ListboxOption value="" className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
              {({ selected }) => (
                <div className="flex items-center justify-between gap-2">
                  <span>Tất cả lớp</span>
                  {selected && <Check className="h-4 w-4 text-red-600" />}
                </div>
              )}
            </ListboxOption>
            {classes.map((className) => (
              <ListboxOption key={className} value={className} className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{className}</span>
                    {selected && <Check className="h-4 w-4 text-red-600" />}
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};

export default StudentHomeworkClassFilter;
