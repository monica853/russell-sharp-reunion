"use client";

import { useEffect, useState } from "react";
import { REUNION_DATE } from "@/lib/config";

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const day = 1000 * 60 * 60 * 24;
  return {
    days: Math.floor(diff / day),
    hours: Math.floor((diff % day) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function Countdown() {
  const target = new Date(REUNION_DATE).getTime();
  const [parts, setParts] = useState(() => getParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Minutes", parts.minutes],
    ["Seconds", parts.seconds],
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {units.map(([label, value]) => (
        <div key={label} className="card-plaque px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[72px] sm:min-w-[96px]">
          <div className="font-heading text-2xl sm:text-4xl text-[var(--gold-bright)] tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-xs tracking-[0.15em] text-[var(--pearl-dim)] mt-1">
            {label.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}
