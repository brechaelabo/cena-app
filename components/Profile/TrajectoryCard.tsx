
import React from 'react';
import { Card } from '../Common/Card';
import { IconProps } from '../Common/Icons';

interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactElement<IconProps>;
}

interface TrajectoryCardProps {
  title?: string;
  stats: StatItem[];
  gridCols?: string; // e.g., 'grid-cols-2 md:grid-cols-4'
}

export const TrajectoryCard: React.FC<TrajectoryCardProps> = ({ 
  title = "Minha Trajetória CENA", 
  stats,
  gridCols = "grid-cols-2 md:grid-cols-4" 
}) => {
  if (stats.length === 0) {
    return null; 
  }

  return (
    <Card title={title} className="mb-8 bg-card-bg">
      <div className={`grid ${gridCols} gap-4 text-center`}>
        {stats.map((stat, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-border-subtle shadow-sm">
            {stat.icon && React.cloneElement(stat.icon, { className: "w-7 h-7 md:w-8 md:h-8 text-link-active mx-auto mb-1.5" })}
            <p className="text-2xl md:text-3xl font-bold text-black">{stat.value}</p> {/* Changed to text-black */}
            <p className="text-xs md:text-sm text-text-muted truncate" title={stat.label}>{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};