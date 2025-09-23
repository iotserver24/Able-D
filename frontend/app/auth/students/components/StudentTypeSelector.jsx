import { STUDENT_TYPES } from "../../../constants/studentTypes";
import { StudentIcon } from "../../../components/icons/StudentIcons";

export const StudentTypeSelector = ({ value, onChange, error }) => {
  return (
    <div className="space-y-4">
      <label className="block text-gray-700 font-medium text-lg">
        Select Your Student Type:
      </label>
      
      <div className="space-y-3">
        {Object.values(STUDENT_TYPES).map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4
              ${value === type.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className={`p-3 rounded-full ${
              value === type.value ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <StudentIcon 
                type={type.icon} 
                className={`w-6 h-6 ${
                  value === type.value ? 'text-blue-600' : 'text-gray-600'
                }`} 
              />
            </div>
            <div className="text-left flex-1">
              <div className={`font-medium ${
                value === type.value ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {type.label}
              </div>
              <div className={`text-sm ${
                value === type.value ? 'text-blue-700' : 'text-gray-500'
              }`}>
                {type.description}
              </div>
            </div>
            {value === type.value && (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};