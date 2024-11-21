import React, { useEffect, useRef } from "react";

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth - 100);
    let height = (canvas.height = window.innerHeight - 200);

    // Speed range customization
    const maxSpeed = 4;
    const minSpeed = 0.1;

    // Parameters for responsiveness
    const getSettings = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        return { pointCount: 20, lineWidth: 1, pointRadius: 2 };
      } else if (window.matchMedia("(max-width: 768px)").matches) {
        return { pointCount: 25, lineWidth: 2, pointRadius: 4 };
      } else {
        return { pointCount: 35, lineWidth: 3, pointRadius: 6 };
      }
    };

    let { pointCount, lineWidth, pointRadius } = getSettings();

    let points: { x: number; y: number; dx: number; dy: number }[] = [];

    // Generate random angle within valid ranges
    const generateValidAngle = (): number => {
      const ranges = [
        [30, 60],
        [120, 150],
        [210, 240],
        [300, 330],
      ];
      const range = ranges[Math.floor(Math.random() * ranges.length)];
      return (Math.random() * (range[1] - range[0]) + range[0]) * (Math.PI / 180); // Convert to radians
    };

    // Initialize points
    const initializePoints = () => {
      points = [];
      for (let i = 0; i < pointCount; i++) {
        const angle = generateValidAngle();
        const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
        points.push({
          x: Math.random() * (width - 2 * pointRadius) + pointRadius,
          y: Math.random() * (height - 2 * pointRadius) + pointRadius,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
        });
      }
    };

    // Calculate alpha based on line length
    const calculateAlpha = (length: number, maxLength: number): number => {
      return Math.max(0, 0.7 - length / maxLength);
    };

    // Calculate speed factor based on distance from center
    const calculateSpeedFactor = (x: number, y: number): number => {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      // Map distance to speed (closer to center = faster)
      return minSpeed + (1 - distance / maxDistance) * (maxSpeed - minSpeed);
    };

    // Draw frame
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const maxLength = Math.min(width, height); // Max length for lines

      // Draw lines between points
      points.forEach((p, i) => {
        const next = points[(i + 1) % points.length];
        const length = Math.sqrt((next.x - p.x) ** 2 + (next.y - p.y) ** 2);
        const alpha = calculateAlpha(length, maxLength);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `rgba(0, 123, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      });

      // Draw points
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 123, 255, 0.5)";
        ctx.fill();

        // Calculate speed factor dynamically
        const speedFactor = calculateSpeedFactor(p.x, p.y);

        // Normalize the direction of movement to maintain consistent angles
        const magnitude = Math.sqrt(p.dx ** 2 + p.dy ** 2);
        p.dx = (p.dx / magnitude) * speedFactor;
        p.dy = (p.dy / magnitude) * speedFactor;

        // Update positions
        p.x += p.dx;
        p.y += p.dy;

        // Bounce on edges considering radius
        if (p.x - pointRadius < 0) {
          p.x = pointRadius;
          p.dx *= -1;
        }
        if (p.x + pointRadius > width) {
          p.x = width - pointRadius;
          p.dx *= -1;
        }
        if (p.y - pointRadius < 0) {
          p.y = pointRadius;
          p.dy *= -1;
        }
        if (p.y + pointRadius > height) {
          p.y = height - pointRadius;
          p.dy *= -1;
        }
      });
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth - 100;
      height = canvas.height = window.innerHeight - 200;

      // Update settings on resize
      ({ pointCount, lineWidth, pointRadius } = getSettings());
      initializePoints();
    };

    // Initialize
    initializePoints();
    animate();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 20,
        left: 50,
        zIndex: -1,
      }}
    />
  );
};

export default AnimatedBackground;
