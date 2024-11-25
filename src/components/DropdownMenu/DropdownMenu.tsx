import React from "react";
import style from "./DropdownMenu.module.css";

interface DropdownMenuProps {
  selectedMode: {
    label: string;
    IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconColor: string;
  };
  isOpen: boolean;
  travelModes: Record<
    string,
    { IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>; iconColor: string }
  >;
  onToggle: () => void;
  onSelect: (mode: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  selectedMode,
  isOpen,
  travelModes,
  onToggle,
  onSelect,
}) => {
  return (
    <div className={style.dropdown_menu_wrapper}>
      <button onClick={onToggle} className={style.dropdown_toggle}>
        {React.createElement(selectedMode.IconComponent, {
          color: selectedMode.iconColor,
          style: { marginRight: "8px", verticalAlign: "middle" },
        })}
        <span>{selectedMode.label}</span> {/* Ensure text is not removed */}
      </button>
      {isOpen && (
        <div className={style.dropdown_menu}>
          {Object.entries(travelModes).map(([mode, details]) => (
            <div
              key={mode}
              className={style.dropdown_item}
              onClick={() => onSelect(mode)}
            >
              {React.createElement(details.IconComponent, {
                color: details.iconColor,
                style: { marginRight: "8px", verticalAlign: "middle" },
              })}
              {mode}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
