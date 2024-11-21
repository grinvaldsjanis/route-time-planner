import React, { useEffect, useRef } from "react";

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth-100);
    let height = (canvas.height = window.innerHeight-200);

    // Define responsive settings
    const getSettings = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        return { pointCount: 10, pointSpeed: 0.1, lineWidth: 1, pointRadius: 2 };
      } else if (window.matchMedia("(max-width: 768px)").matches) {
        return { pointCount: 30, pointSpeed: 0.4, lineWidth: 2, pointRadius: 4 };
      } else {
        return { pointCount: 30, pointSpeed: 0.8, lineWidth: 3, pointRadius: 8 };
      }
    };

    let { pointCount, pointSpeed, lineWidth, pointRadius } = getSettings();

    let points: { x: number; y: number; dx: number; dy: number }[] = [];

    const initializePoints = () => {
      points = [];
      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * pointSpeed,
          dy: (Math.random() - 0.5) * pointSpeed,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw lines between points
      ctx.beginPath();
      points.forEach((p, i) => {
        ctx.moveTo(p.x, p.y);
        const next = points[(i + 1) % points.length];
        ctx.lineTo(next.x, next.y);
      });
      ctx.strokeStyle = "rgba(0, 123, 255, 0.1)";
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw points
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 123, 255, 0.5)";
        ctx.fill();

        // Update positions
        p.x += p.dx;
        p.y += p.dy;

        // Bounce on edges
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
      });
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth-100;
      height = canvas.height = window.innerHeight-200;

      // Update settings on resize
      ({ pointCount, pointSpeed, lineWidth, pointRadius } = getSettings());
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
        top: 50,
        left: 50,
        zIndex: -1,
      }}
    />
  );
};

export default AnimatedBackground;
