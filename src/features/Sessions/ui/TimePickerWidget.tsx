// src/features/Sessions/ui/TimePickerWidget.tsx
'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TimePickerWidgetProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
}

export const TimePickerWidget = ({
  selected,
  onChange,
}: TimePickerWidgetProps) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
      wrapperClassName="w-full"
      placeholderText="Select date and time"
      maxDate={new Date()}
    />
  );
};
// src/features/Sessions/ui/TimePickerWidget.tsx
