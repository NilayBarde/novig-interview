export function LoadingState() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Verdict banner skeleton */}
      <div className="glass-warm rounded-2xl p-5 shadow-lg shadow-sand-300/20">
        <div className="flex items-center gap-4">
          <div className="shimmer h-4 w-32 rounded-md" />
          <div className="shimmer h-8 w-48 rounded-lg" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-warm rounded-2xl p-5 shadow-lg shadow-sand-300/20">
          <div className="shimmer h-3 w-24 rounded-md mb-3" />
          <div className="shimmer h-48 w-full rounded-xl" />
        </div>
        <div className="glass-warm rounded-2xl p-5 shadow-lg shadow-sand-300/20">
          <div className="shimmer h-3 w-24 rounded-md mb-3" />
          <div className="shimmer h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-warm rounded-2xl overflow-hidden shadow-lg shadow-sand-300/20">
      <div className="shimmer h-1" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="shimmer h-2.5 w-16 rounded-md" />
            <div className="shimmer h-5 w-24 rounded-md" />
          </div>
          <div className="shimmer h-10 w-14 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-8 rounded-md" />
          ))}
        </div>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="shimmer h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
