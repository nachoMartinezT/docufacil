import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function MonthSelector({ selectedDate, onDateChange }) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    let newMonth = selectedDate.month - 1;
    let newYear = selectedDate.year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    onDateChange(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = selectedDate.month + 1;
    let newYear = selectedDate.year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    onDateChange(newYear, newMonth);
  };

  const handleMonthSelect = (e) => {
    onDateChange(selectedDate.year, parseInt(e.target.value));
  };

  const handleYearSelect = (e) => {
    onDateChange(parseInt(e.target.value), selectedDate.month);
  };

  // Generate year options (current year +/- 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <Calendar className="w-5 h-5 text-primary-400 hidden sm:block" />
          
          <select
            value={selectedDate.month}
            onChange={handleMonthSelect}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedDate.year}
            onChange={handleYearSelect}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default MonthSelector;
