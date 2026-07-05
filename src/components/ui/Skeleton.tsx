import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export default function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-gray-200 rounded-lg',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            className
          )}
          style={{ height: className?.includes('h-') ? undefined : '1rem' }}
        />
      ))}
    </div>
  );
}
