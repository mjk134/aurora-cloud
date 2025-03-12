import { useState } from "react";

export default function ContextMenuWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      toggled: true,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  };

  return (
    <div onContextMenu={handleContextMenu} onClick={closeContextMenu}>
      {contextMenu.toggled && (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-md"
          style={{ top: contextMenu.position.y, left: contextMenu.position.x }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
