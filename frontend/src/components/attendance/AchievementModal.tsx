import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Award, Star, Trophy, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'flame' | 'award' | 'star' | 'trophy' | 'trending';
  color: string;
  requirement: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface AchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  bestStreak: number;
  badges: string[];
  perfectWeeks: number;
  perfectMonths: number;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  open,
  onOpenChange,
  currentStreak,
  bestStreak,
  badges,
  perfectWeeks,
  perfectMonths,
}) => {
  const achievements: Achievement[] = [
    {
      id: 'perfect_week',
      name: 'Perfect Week',
      description: '100% attendance for 7 consecutive days',
      icon: 'star',
      color: 'from-blue-500 to-cyan-500',
      requirement: '7 day streak',
      unlocked: badges.includes('perfect_week'),
      unlockedDate: badges.includes('perfect_week') ? new Date().toLocaleDateString() : undefined,
    },
    {
      id: 'monthly_star',
      name: 'Monthly Star',
      description: '100% attendance for an entire month',
      icon: 'trophy',
      color: 'from-yellow-500 to-orange-500',
      requirement: '30 day streak',
      unlocked: badges.includes('monthly_star'),
      unlockedDate: badges.includes('monthly_star') ? new Date().toLocaleDateString() : undefined,
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 30-day attendance streak',
      icon: 'flame',
      color: 'from-orange-500 to-red-500',
      requirement: '30 consecutive days',
      unlocked: badges.includes('streak_master'),
      unlockedDate: badges.includes('streak_master') ? new Date().toLocaleDateString() : undefined,
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Always on time for 2 weeks straight',
      icon: 'trending',
      color: 'from-green-500 to-emerald-500',
      requirement: '14 days on time',
      unlocked: badges.includes('early_bird'),
      unlockedDate: badges.includes('early_bird') ? new Date().toLocaleDateString() : undefined,
    },
    {
      id: 'comeback_king',
      name: 'Comeback King',
      description: 'Improved from <80% to >95% attendance',
      icon: 'award',
      color: 'from-purple-500 to-pink-500',
      requirement: 'Attendance improvement',
      unlocked: badges.includes('comeback_king'),
      unlockedDate: badges.includes('comeback_king') ? new Date().toLocaleDateString() : undefined,
    },
  ];

  const iconMap = {
    flame: Flame,
    award: Award,
    star: Star,
    trophy: Trophy,
    trending: TrendingUp,
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Achievements & Badges</DialogTitle>
          <DialogDescription>
            Track your attendance milestones and earn rewards
          </DialogDescription>
        </DialogHeader>

        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold text-foreground">
                  {unlockedCount} / {achievements.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-3xl font-bold text-primary">
                  {progressPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{perfectWeeks}</p>
              <p className="text-xs text-muted-foreground">Perfect Weeks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{perfectMonths}</p>
              <p className="text-xs text-muted-foreground">Perfect Months</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">All Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = iconMap[achievement.icon];
              
              return (
                <Card
                  key={achievement.id}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300',
                    achievement.unlocked
                      ? 'border-2 border-primary/50 shadow-lg hover:shadow-xl'
                      : 'opacity-60 hover:opacity-80'
                  )}
                >
                  {achievement.unlocked && (
                    <div className={cn(
                      'absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10',
                      achievement.color
                    )} />
                  )}
                  
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          achievement.unlocked
                            ? `bg-gradient-to-br ${achievement.color}`
                            : 'bg-muted'
                        )}
                      >
                        {achievement.unlocked ? (
                          <Icon className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground">
                            {achievement.name}
                          </h4>
                          {achievement.unlocked && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">{achievement.requirement}</Badge>
                          {achievement.unlockedDate && (
                            <span>• {achievement.unlockedDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Milestone */}
        {unlockedCount < achievements.length && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Keep Going!</p>
                  <p className="text-sm text-muted-foreground">
                    {achievements.length - unlockedCount} more achievement{achievements.length - unlockedCount > 1 ? 's' : ''} to unlock
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

