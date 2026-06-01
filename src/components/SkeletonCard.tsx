/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function SkeletonCard() {
  return (
    <div className="w-44 flex-shrink-0 animate-pulse bg-slate-800/40 rounded-xl overflow-hidden glass p-2 border border-blue-500/5">
      <div className="aspect-[2/3] w-full bg-slate-700/50 rounded-lg sm:aspect-[2/3]" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-slate-700/50 rounded w-5/6" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-slate-700/30 rounded w-1/3" />
          <div className="h-3 bg-slate-700/30 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
