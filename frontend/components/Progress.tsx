const Progress = ({
  title,
  percentage,
}: {
  title: string;
  percentage: number;
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const displayPercentage = clampedPercentage.toFixed(2);

  return (
    <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4 flex-col">
      <span className="font-medium text-sm sm:text-base truncate">{title}</span>
      <div className="flex items-center gap-2">
        <div className="w-full h-3 sm:h-4 md:h-5 bg-titan-white rounded-full overflow-hidden">
          <div
            className="h-full bg-cornflower-blue rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${clampedPercentage}%` }}
          ></div>
        </div>
        <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
          {displayPercentage}%
        </span>
      </div>
    </div>
  );
};

export default Progress;
