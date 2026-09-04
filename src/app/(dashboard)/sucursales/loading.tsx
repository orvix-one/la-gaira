import { SkeletonBloque, SkeletonKpis } from "@/ui/components/states";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-neutral-200" />
      <SkeletonKpis />
      <div className="grid gap-4 xl:grid-cols-5">
        <SkeletonBloque alto="h-72 xl:col-span-3" />
        <SkeletonBloque alto="h-72 xl:col-span-2" />
      </div>
      <SkeletonBloque alto="h-80" />
    </div>
  );
}
