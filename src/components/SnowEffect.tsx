import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
}

export const SnowEffect = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = [];
    for (let i = 0; i < 50; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        size: 2 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.6,
      });
    }
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            backgroundColor: "white",
            borderRadius: "50%",
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            boxShadow: `0 0 ${flake.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
    </div>
  );
};
