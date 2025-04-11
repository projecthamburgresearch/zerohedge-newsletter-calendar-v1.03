interface Props {
  dayFilter: string | null;
  weekFilter: string | null;
  sourceFilter: string | null;
  typeFilter: string | null;
  onDayFilterChange: (value: string | null) => void;
  onWeekFilterChange: (value: string | null) => void;
  onSourceFilterChange: (value: string | null) => void;
  onTypeFilterChange: (value: string | null) => void;
  dayOptions: { value: string; label: string; }[];
  weekOptions: { value: string; label: string; }[];
  sourceOptions: string[];
  typeOptions: string[];
}

export const CalendarFilters: React.FC<Props> = ({
  dayFilter,
  weekFilter,
  sourceFilter,
  typeFilter,
  onDayFilterChange,
  onWeekFilterChange,
  onSourceFilterChange,
  onTypeFilterChange,
  dayOptions,
  weekOptions,
  sourceOptions,
  typeOptions
}) => {
  return (
    <div className="flex space-x-4">
      <select
        value={dayFilter || ''}
        onChange={(e) => onDayFilterChange(e.target.value || null)}
        className="px-4 py-2 border rounded bg-white hover:border-gray-400 focus:outline-none focus:border-gray-500 h-[38px]"
      >
        <option value="">All Days</option>
        {dayOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={weekFilter || ''}
        onChange={(e) => onWeekFilterChange(e.target.value || null)}
        className="px-4 py-2 border rounded bg-white hover:border-gray-400 focus:outline-none focus:border-gray-500 h-[38px]"
      >
        <option value="">All Weeks</option>
        {weekOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={sourceFilter || ''}
        onChange={(e) => onSourceFilterChange(e.target.value || null)}
        className="px-4 py-2 border rounded bg-white hover:border-gray-400 focus:outline-none focus:border-gray-500 h-[38px]"
      >
        <option value="">All Sources</option>
        {sourceOptions.map(source => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>

      <select
        value={typeFilter || ''}
        onChange={(e) => onTypeFilterChange(e.target.value || null)}
        className="px-4 py-2 border rounded bg-white hover:border-gray-400 focus:outline-none focus:border-gray-500 h-[38px]"
      >
        <option value="">All Types</option>
        {typeOptions.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}; 