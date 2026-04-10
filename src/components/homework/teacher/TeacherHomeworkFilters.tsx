import React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface TeacherHomeworkFiltersProps {
  classOptions: Option[];
  sessionOptions: Option[];
  selectedClassId: string;
  selectedSessionId: string;
  onClassChange: (classId: string) => void;
  onSessionChange: (sessionId: string) => void;
}

const TeacherHomeworkFilters: React.FC<TeacherHomeworkFiltersProps> = ({
  classOptions,
  sessionOptions,
  selectedClassId,
  selectedSessionId,
  onClassChange,
  onSessionChange,
}) => {
  const classLabel = classOptions.find((option) => option.value === selectedClassId)?.label ?? "Tất cả lớp";
  const sessionLabel = sessionOptions.find((option) => option.value === selectedSessionId)?.label ?? "Tất cả buổi";

  return (
    <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div>
        <label className="text-xs font-semibold text-gray-600">Lớp</label>
        <Listbox value={selectedClassId} onChange={onClassChange}>
          <div className="relative mt-1">
            <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left text-xs text-gray-700 outline-none focus:border-red-400">
              <span className="block truncate">{classLabel}</span>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </ListboxButton>
            <ListboxOptions className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              <ListboxOption value="" className={({ focus }) => `cursor-pointer px-3 py-2 text-xs ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span>Tất cả lớp</span>
                    {selected && <Check className="h-3.5 w-3.5 text-red-600" />}
                  </div>
                )}
              </ListboxOption>
              {classOptions.map((option) => (
                <ListboxOption key={option.value} value={option.value} className={({ focus }) => `cursor-pointer px-3 py-2 text-xs ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {selected && <Check className="h-3.5 w-3.5 text-red-600" />}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* <div>
        <label className="text-xs font-semibold text-gray-600">Buổi học</label>
        <Listbox value={selectedSessionId} onChange={onSessionChange}>
          <div className="relative mt-1">
            <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left text-xs text-gray-700 outline-none focus:border-red-400">
              <span className="block truncate">{sessionLabel}</span>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </ListboxButton>
            <ListboxOptions className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              <ListboxOption value="" className={({ focus }) => `cursor-pointer px-3 py-2 text-xs ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span>Tất cả buổi</span>
                    {selected && <Check className="h-3.5 w-3.5 text-red-600" />}
                  </div>
                )}
              </ListboxOption>
              {sessionOptions.map((option) => (
                <ListboxOption key={option.value} value={option.value} className={({ focus }) => `cursor-pointer px-3 py-2 text-xs ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {selected && <Check className="h-3.5 w-3.5 text-red-600" />}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div> */}
    </div>
  );
};

export default TeacherHomeworkFilters;
