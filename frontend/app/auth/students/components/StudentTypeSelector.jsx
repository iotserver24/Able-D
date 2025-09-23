import { STUDENT_TYPES } from "../../../constants/studentTypes";
import { 
  EyeIcon, 
  EarIcon, 
  MicIcon, 
  BookIcon, 
  CheckIcon, 
  ErrorIcon 
} from "../../../components/icons/Icons";

export const StudentTypeSelector = ({ value, onChange, error }) => {
  // Map icon names to components
  const iconMap = {
    'eye': EyeIcon,
    'ear': EarIcon,
    'mic': MicIcon,
    'book': BookIcon,
  };

  // Get color classes based on type
  const getColorClasses = (type, isSelected) => {
    const colorMap = {
      'blue': {
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        bg: isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
        iconBg: isSelected ? 'bg-blue-100' : 'bg-gray-100',
        iconText: isSelected ? 'text-blue-600' : 'text-gray-600',
        titleText: isSelected ? 'text-blue-900' : 'text-gray-900',
        descText: isSelected ? 'text-blue-700' : 'text-gray-500',
      },
      'green': {
        border: isSelected ? 'border-green-500' : 'border-gray-200',
        bg: isSelected ? 'bg-green-50' : 'hover:bg-gray-50',
        iconBg: isSelected ? 'bg-green-100' : 'bg-gray-100',
        iconText: isSelected ? 'text-green-600' : 'text-gray-600',
        titleText: isSelected ? 'text-green-900' : 'text-gray-900',
        descText: isSelected ? 'text-green-700' : 'text-gray-500',
      },
      'purple': {
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        bg: isSelected ? 'bg-purple-50' : 'hover:bg-gray-50',
        iconBg: isSelected ? 'bg-purple-100' : 'bg-gray-100',
        iconText: isSelected ? 'text-purple-600' : 'text-gray-600',
        titleText: isSelected ? 'text-purple-900' : 'text-gray-900',
        descText: isSelected ? 'text-purple-700' : 'text-gray-500',
      },
      'orange': {
        border: isSelected ? 'border-orange-500' : 'border-gray-200',
        bg: isSelected ? 'bg-orange-50' : 'hover:bg-gray-50',
        iconBg: isSelected ? 'bg-orange-100' : 'bg-gray-100',
        iconText: isSelected ? 'text-orange-600' : 'text-gray-600',
        titleText: isSelected ? 'text-orange-900' : 'text-gray-900',
        descText: isSelected ? 'text-orange-700' : 'text-gray-500',
      },
    };
    return colorMap[type.primaryColor] || colorMap['blue'];
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <label className="block text-gray-700 font-medium text-base md:text-lg px-2 md:px-0">
        Select Your Learning Profile:
      </label>
      
      <div className="space-y-2 md:space-y-3">
        {Object.values(STUDENT_TYPES).map((type) => {
          const isSelected = value === type.value;
          const colors = getColorClasses(type, isSelected);
          const IconComponent = iconMap[type.icon] || BookIcon;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all duration-200 
                flex items-center space-x-3 md:space-x-4 ${colors.border} ${colors.bg}
                hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-${type.primaryColor}-500`}
              aria-label={`Select ${type.label}`}
              role="radio"
              aria-checked={isSelected}
            >
              {/* Icon */}
              <div className={`p-2 md:p-3 rounded-full ${colors.iconBg} flex-shrink-0`}>
                <IconComponent 
                  className={colors.iconText}
                  size="w-5 h-5 md:w-6 md:h-6"
                />
              </div>
              
              {/* Content */}
              <div className="text-left flex-1 min-w-0">
                <div className={`font-medium text-sm md:text-base ${colors.titleText}`}>
                  {type.label}
                </div>
                <div className={`text-xs md:text-sm mt-0.5 ${colors.descText} 
                  line-clamp-2 md:line-clamp-none`}>
                  {type.description}
                </div>
                {/* Features - Hidden on mobile, shown on tablet+ */}
                <div className="hidden md:flex flex-wrap gap-1 mt-2">
                  {type.features.slice(0, 2).map((feature, idx) => (
                    <span 
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? `bg-${type.primaryColor}-100 text-${type.primaryColor}-700` 
                                  : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Check mark */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <CheckIcon 
                    className={`text-${type.primaryColor}-600`}
                    size="w-5 h-5 md:w-6 md:h-6"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Error message - Mobile optimized */}
      {error && (
        <div className="mt-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg mx-2 md:mx-0">
          <p className="text-red-600 text-xs md:text-sm flex items-center">
            <ErrorIcon className="mr-2 flex-shrink-0" size="w-4 h-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Mobile helper text */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-xs text-gray-500 px-4">
          Tap to select your preferred learning style
        </p>
      </div>
    </div>
  );
};
