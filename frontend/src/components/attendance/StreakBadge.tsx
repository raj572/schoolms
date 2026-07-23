import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Award, Star, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  badges?: string[];
  perfectWeeks?: number;
  perfectMonths?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  bestStreak,
  badges = [],
  perfectWeeks = 0,
  perfectMonths = 0,
  size = 'md',
  showDetails = true,
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const badgeConfig: Record<string, { icon: any; label: string; color: string }> = {
    perfect_week: {
      icon: Star,
      label: 'Perfect Week',
      color: 'text-blue-500',
    },
    monthly_star: {
      icon: Trophy,
      label: 'Monthly Star',
      color: 'text-yellow-500',
    },
    streak_master: {
      icon: Award,
      label: 'Streak Master',
      color: 'text-purple-500',
    },
    early_bird: {
      icon: TrendingUp,
      label: 'Early Bird',
      color: 'text-green-500',
    },
    comeback_king: {
      icon: Flame,
      label: 'Comeback King',
      color: 'text-orange-500',
    },
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-primary">
              {bestStreak}
            </p>
            <p className="text-xs text-muted-foreground">Best Ever</p>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-primary/10 rounded-lg p-2 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {perfectWeeks}
                </p>
                <p className="text-xs text-muted-foreground">Perfect Weeks</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {perfectMonths}
                </p>
                <p className="text-xs text-muted-foreground">Perfect Months</p>
              </div>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Achievements
                </p>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badgeKey) => {
                    const config = badgeConfig[badgeKey];
                    if (!config) return null;
                    const Icon = config.icon;

                    return (
                      <Badge
                        key={badgeKey}
                        variant="outline"
                        className="flex items-center gap-1 bg-background"
                      >
                        <Icon className={cn('w-3 h-3', config.color)} />
                        <span className="text-xs">{config.label}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Milestone */}
            {currentStreak < 7 && (
              <div className="mt-4 p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {7 - currentStreak} more days to unlock{' '}
                  <span className="font-semibold text-foreground">
                    Perfect Week
                  </span>{' '}
                  badge!
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

