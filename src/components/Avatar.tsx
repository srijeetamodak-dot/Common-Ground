import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

export interface AvatarProps {
  user?: Partial<UserProfile> | {
    id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
    useStandardAvatar?: boolean;
    isVerified?: boolean;
  };
  src?: string;
  name?: string;
  username?: string;
  useStandardAvatar?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isVerified?: boolean;
  showBadge?: boolean;
  showRollStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  src,
  name,
  username,
  useStandardAvatar,
  size = 'md',
  className = '',
  isVerified,
  showBadge = false,
  showRollStatus = false,
}) => {
  // Extract resolved values from either user object or direct props
  const resolvedSrc = src !== undefined ? src : user?.avatarUrl;
  const resolvedName = name !== undefined ? name : user?.name || '';
  const resolvedUsername = username !== undefined ? username : user?.username || '';
  const resolvedUseStandard = useStandardAvatar !== undefined
    ? useStandardAvatar
    : user?.useStandardAvatar ?? false;
  const resolvedIsVerified = isVerified !== undefined
    ? isVerified
    : user?.isVerified ?? false;

  const getInitials = () => {
    const raw = resolvedUsername || resolvedName || 'JMC';
    const clean = raw.replace(/^@/, '');
    if (!clean) return 'U';
    const parts = clean.split(/[._\s-]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const isNoPhoto = resolvedUseStandard || !resolvedSrc || resolvedSrc.trim() === '';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {isNoPhoto ? (
        // Standard White Circle (No Photo Option)
        <div
          className={`${sizeClasses[size]} rounded-full bg-white border-2 border-stone-200 text-stone-700 shadow-xs flex items-center justify-center font-bold font-mono tracking-wider select-none hover:border-red-400 transition-colors`}
          title={resolvedUsername ? `@${resolvedUsername}` : resolvedName}
        >
          {resolvedName || resolvedUsername ? (
            <span>{getInitials()}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-stone-400" />
          )}
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={resolvedUsername || resolvedName || 'Profile'}
          className={`${sizeClasses[size]} rounded-full object-cover border border-stone-200 shadow-xs`}
          onError={(e) => {
            // Fallback to standard white circle if image fails to load
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      )}

      {(showBadge || showRollStatus) && resolvedIsVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-white shadow-xs">
          <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
};
