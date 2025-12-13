"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface DeliveryCountdownProps {
  deliveryTime: string | null;
}

const DeliveryCountdown: React.FC<DeliveryCountdownProps> = ({ deliveryTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!deliveryTime) {
      setTimeLeft("You can still place order");
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(deliveryTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(false);
        setTimeLeft("You can still place order");
        return;
      }

      setIsExpired(false);

      const totalMinutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (totalMinutes > 0) {
        setTimeLeft(`${totalMinutes} minutes to next free delivery`);
      } else {
        setTimeLeft(`${seconds} seconds to next free delivery`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [deliveryTime]);

  const getShortTime = () => {
    if (timeLeft === "You can still place order") return null; // Just show clock, no text
    // Extract just the time part (e.g., "5 minutes" from "5 minutes to next free delivery")
    return timeLeft.replace(" to next free delivery", "");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition hover:scale-105 active:scale-95 ${
          timeLeft === "You can still place order"
            ? "bg-blue-100 text-blue-700" 
            : "bg-green-100 text-green-700"
        }`}
      >
        <Clock className="text-base sm:text-lg" />
        {/* Desktop: Full text */}
        <span className="hidden sm:inline">{timeLeft}</span>
        {/* Mobile: Time only, or just clock if no time set */}
        {getShortTime() && <span className="sm:hidden">{getShortTime()}</span>}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 sm:hidden">
          <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {timeLeft}
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCountdown;
