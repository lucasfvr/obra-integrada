import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm"></div>
        ))}
      </div>
    </div>
  );
}

export function ObraSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          </div>
          <div className="h-8 w-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0"></div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm"></div>
        ))}
      </div>
    </div>
  );
}

export function TaskSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
             <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
             </div>
             <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
             <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
             <div className="pt-4 flex justify-between">
                <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
             </div>
          </div>
        ))}
      </div>
    );
}
