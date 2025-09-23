export const Select = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  error = false,
  className = "" 
}) => {
  return (
    <select
      className={`w-full px-4 py-3 border-2 rounded-lg transition-colors duration-200 
        ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} 
        focus:outline-none ${className}`}
      value={value}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};