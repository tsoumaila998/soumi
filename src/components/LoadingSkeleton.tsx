import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#16161d] rounded-xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[2/3] w-full bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[65vh] min-h-[500px] bg-[#101015] animate-pulse flex items-end pb-16 px-6 sm:px-12">
      <div className="max-w-2xl w-full space-y-4">
        <div className="h-6 w-32 bg-white/10 rounded-md" />
        <div className="h-12 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-16 w-full bg-white/5 rounded-lg" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-32 bg-white/15 rounded-xl" />
          <div className="h-10 w-32 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] animate-pulse">
      <div className="w-full h-[55vh] bg-[#121218]" />
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-64 aspect-[2/3] rounded-2xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-4 pt-12">
          <div className="h-10 w-2/3 bg-white/15 rounded" />
          <div className="h-5 w-1/3 bg-white/10 rounded" />
          <div className="h-24 w-full bg-white/5 rounded" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 bg-white/20 rounded-xl" />
            <div className="h-12 w-40 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
