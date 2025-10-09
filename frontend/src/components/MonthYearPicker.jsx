// frontend/src/components/MonthYearPicker.jsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MonthYearPicker = ({ selectedDate, onDateChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  // --- THIS IS THE ROBUST LOGIC ---
  const handleMonthChange = (monthValue) => {
    const newDate = new Date(selectedDate.getTime());
    newDate.setMonth(parseInt(monthValue) - 1);
    onDateChange(newDate);
  };

  const handleYearChange = (yearValue) => {
    const newDate = new Date(selectedDate.getTime());
    newDate.setFullYear(parseInt(yearValue));
    onDateChange(newDate);
  };

  return (
    <div className="flex gap-2">
      <Select onValueChange={handleMonthChange} value={(selectedDate.getMonth() + 1).toString()}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select onValueChange={handleYearChange} value={selectedDate.getFullYear().toString()}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthYearPicker;