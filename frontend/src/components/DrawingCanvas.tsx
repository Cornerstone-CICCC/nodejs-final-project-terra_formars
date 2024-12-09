import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../socket/socket.client";
import { useRoomStore } from "../store/useRoomStore";

interface Point {
  x: number;
  y: number;
}
interface Path {
  points: Point[];
  color: string;
}
const DrawingCanvas = () => {
  const socket = getSocket();
  const { roomId, drawer } = useRoomStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentColor, setCurrentColor] = useState("black");
  const colors = ["black", "red", "green", "blue", "yellow", "purple"];

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    console.log("ss");
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    // SVGの座標系に変換
    const transformedPoint = point.matrixTransform(
      svg.getScreenCTM()?.inverse()
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  const startDrawing = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawer) return;

    const point = getCoordinates(e);
    setIsDrawing(true);
    setCurrentPath([point]);
  };

  const draw = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawer) return;

    const point = getCoordinates(e);
    setCurrentPath((prev) => [...prev, point]);
  };

  const stopDrawing = () => {
    if (!drawer) return;

    setIsDrawing(false);
    setPaths((prev) => [...prev, { points: currentPath, color: currentColor }]);

    socket.emit("room:draw", {
      type: "end",
      points: currentPath,
      color: currentColor,
      roomId,
    });
  };

  const handleClearCanvas = () => {
    if (!drawer) return;
    setPaths([]);
    socket.emit("room:clear", roomId);
  };

  const handleClearCanvasSync = () => {
    setPaths([]);
  };

  useEffect(() => {
    if (!socket) return;

    const handleDrawSync = (data: {
      type: "end";
      points: Point[];
      color: string;
    }) => {
      setPaths((prev) => [...prev, { points: data.points, color: data.color }]);
    };

    socket.on("room:draw_sync", handleDrawSync);
    socket.on("room:clear_canvas", handleClearCanvasSync);
    return () => {
      socket.off("room:draw_sync", handleDrawSync);
      socket.off("room:clear_canvas", () => setPaths([]));
    };
  }, [socket]);

  const getPathData = (points: Point[]) => {
    if (points.length === 0) return "";
    return (
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((point) => `L ${point.x} ${point.y}`)
        .join(" ")
    );
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!drawer) return;
    e.preventDefault(); // prevent default scroll

    const touch = e.touches[0];
    const point = getCoordinatesFromTouch(touch);
    setIsDrawing(true);
    setCurrentPath([point]);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawer) return;
    e.preventDefault();

    const touch = e.touches[0];
    const point = getCoordinatesFromTouch(touch);
    setCurrentPath((prev) => [...prev, point]);
  };

  const handleTouchEnd = () => {
    if (!drawer) return;
    stopDrawing();
  };

  const getCoordinatesFromTouch = (touch: React.Touch): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = touch.clientX;
    point.y = touch.clientY;

    const transformedPoint = point.matrixTransform(
      svg.getScreenCTM()?.inverse()
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  return (
    <div className="h-[480px] rounded-xl border-2 border-black bg-white mt-4">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }} // prevent default scroll
      >
        {paths.map((path, index) => (
          <path
            key={index}
            d={getPathData(path.points)}
            stroke={path.color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* 現在描画中のパス */}
        {isDrawing && (
          <path
            d={getPathData(currentPath)}
            stroke={currentColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {drawer ? (
        <div className="tools flex justify-end rounded-md p-3 gap-3">
          {colors.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
          <button onClick={handleClearCanvas}>
            <img src="/trash.png" alt="" className="w-7" />
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default DrawingCanvas;
