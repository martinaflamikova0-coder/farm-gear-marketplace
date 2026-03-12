import { Bot } from 'lucide-react';
import SpecialProductSection from './SpecialProductSection';

const RobotMowersSection = () => (
  <SpecialProductSection
    titleKey="home.robotMowers"
    subtitleKey="home.robotMowersSubtitle"
    searchTerm="robot tondeuse"
    icon={Bot}
    iconColorClass="text-primary"
    bgClass="bg-gradient-to-b from-primary/5 to-transparent"
  />
);

export default RobotMowersSection;
