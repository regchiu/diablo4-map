import { MouseEvent } from "react";
import { useCurrentWindow } from "../lib/windows";

export default function ResizeBorders() {
  const currentWindow = useCurrentWindow();
  const isMaximized = currentWindow?.stateEx === "maximized";
  if (isMaximized) {
    return <></>;
  }

  function onDragResize(edge: string) {
    return (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
      event.stopPropagation();
      // @ts-ignore
      overwolf.windows.dragResize(currentWindow!.id, edge);
    };
  }

  return (
    <>
      <div
        className="fixed z-[10000] top-0 left-0 right-0 h-1.5 cursor-n-resize"
        onMouseDown={onDragResize("Top")}
      />
      <div
        className="fixed z-[10000] top-0 bottom-0 right-0 w-1.5 cursor-e-resize"
        onMouseDown={onDragResize("Right")}
      />
      <div
        className="fixed z-[10000] bottom-0 left-0 right-0 h-1.5 cursor-s-resize"
        onMouseDown={onDragResize("Bottom")}
      />
      <div
        className="fixed z-[10000] top-0 left-0 bottom-0 w-1.5 cursor-w-resize"
        onMouseDown={onDragResize("Left")}
      />
      <div
        className="fixed z-[10000] top-0 left-0 h-1.5 w-1.5 cursor-nw-resize"
        onMouseDown={onDragResize("TopLeft")}
      />
      <div
        className="fixed z-[10000] top-0 right-0 h-1.5 w-1.5 cursor-ne-resize"
        onMouseDown={onDragResize("TopRight")}
      />
      <div
        className="fixed z-[10000] bottom-0 left-0 h-1.5 w-1.5 cursor-sw-resize"
        onMouseDown={onDragResize("BottomLeft")}
      />
      <div
        className="fixed z-[10000] bottom-0 right-0 h-1.5 w-1.5 cursor-se-resize"
        onMouseDown={onDragResize("BottomRight")}
      />
    </>
  );
}
