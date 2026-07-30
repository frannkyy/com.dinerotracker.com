import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  color?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color = '#3B82F6',
  className = 'w-9 h-9 rounded-xl',
  size = 18,
}) => {
  // @ts-ignore
  const IconComponent = Icons[iconName] || Icons.Tag;

  return (
    <div
      className={`${className} flex items-center justify-center shrink-0 shadow-xs`}
      style={{ backgroundColor: `${color}18`, color: color }}
    >
      <IconComponent size={size} style={{ color }} />
    </div>
  );
};
