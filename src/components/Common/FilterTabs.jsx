import { Cctv, HouseWifi, List, Speaker, Tv2 } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

const filterIcons = [
  { name: 'All', icon: List },
  { name: 'Home Cinema', icon: Tv2 },
  { name: 'Security System', icon: Cctv },
  { name: 'Home Automation', icon: HouseWifi },
  { name: 'Outdoor Audio', icon: Speaker }
];

const FilterTabs = ({ selectedFilter, onFilterChange }) => {
  const getBackgroundColor = (filterName) => {
    switch (filterName) {
      case 'Home Cinema':
        return 'bg-services-cinema-light border border-services-cinema-border';
      case 'Security System':
        return 'bg-services-security-light border border-services-security-border';
      case 'Home Automation':
        return 'bg-services-automation-light border border-services-automation-border';  
      case 'Outdoor Audio':
        return 'bg-services-audio-light border border-services-audio-border';
      default:
        return 'bg-services-default-light border border-services-default-border';
    }
  };

  const getIconColor = (filterName, isActive) => {
    if (!isActive) return '#666666';
    
    switch (filterName) {
      case 'All':
        return '#374151';
      case 'Home Cinema':
        return '#7c3aed';
      case 'Security System':
        return '#0891b2';
      case 'Home Automation':
        return '#2563eb';  
      case 'Outdoor Audio':
        return '#db2777';
      default:
        return '#666666';
    }
  };

  return (
    <View className="relative mb-8 mt-2">
      <View className={`flex-row justify-around py-3 px-2 min-w-[95%] mx-auto rounded-full ${
        getBackgroundColor(selectedFilter)
      }`}>
        {filterIcons.map((filter, index) => {
          const IconComponent = filter.icon;
          const isActive = selectedFilter === filter.name;
          
          return (
            <TouchableOpacity 
              key={index}
              className="items-center w-14"
              onPress={() => onFilterChange(filter.name)}
            >
              <View>
                <IconComponent 
                  size={24} 
                  color={getIconColor(filter.name, isActive)} 
                  strokeWidth={2} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default FilterTabs;