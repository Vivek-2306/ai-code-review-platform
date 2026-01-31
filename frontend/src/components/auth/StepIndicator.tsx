type StepIndicatorProps = {
  step: number;
  totalSteps: number;
  title: string;
};

export function StepIndicator({ step, totalSteps, title }: StepIndicatorProps) {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Step {step} of {totalSteps}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#324d67] rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
