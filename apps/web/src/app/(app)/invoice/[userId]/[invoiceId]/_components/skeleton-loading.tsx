import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PaytmentPageLoading = () => {
  return (
    <div className="flex-grow top-14 relative flex items-center justify-center p-4">
      <div className="w-full mx-[3%] shadow-xl rounded-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="bg-white p-8">
          <Skeleton className="h-8 w-24 mb-4" />

          <div className="mb-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="mb-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>

          <div className="bg-white border border-yellow-100 rounded-lg p-4 mb-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between mt-4 border-t pt-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>

        {/* Right side - Steps skeleton */}
        <div className="p-8 bg-[#ffffff33] backdrop-blur-md flex flex-col justify-center">
          <div className="max-w-2xl mx-auto flex flex-col gap-4 justify-center items-center w-full">
            {/* Step Indicator skeleton */}
            <div className="mb-8 w-full">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center mx-2">
                    <Skeleton className="w-10 h-10 rounded-full mb-2" />
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm w-full">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaytmentPageLoading;
