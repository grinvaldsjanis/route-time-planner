import {
  FaWalking,
  FaRunning,
  FaBicycle,
  FaMotorcycle,
  FaCarSide,
} from "react-icons/fa";

export type TravelMode = keyof typeof travelModes;

const travelModes = {
  "Casual Walking": {
    maxSpeed: 5, // km/h
    maxSpeedRadius: 4,
    handlingFactor: 10,
    powerFactor: 0.1, // kW (human walking energy)
    weight: 70, // kg (average human)
    terrain: "flat",
    description: "Leisurely walking",
    IconComponent: FaWalking,
    iconColor: "#4CAF50",
  },
  "Brisk Walking": {
    maxSpeed: 6.5, // km/h
    maxSpeedRadius: 3,
    handlingFactor: 10,
    powerFactor: 0.15, // kW
    weight: 70, // kg
    terrain: "flat",
    description: "Fast walking",
    IconComponent: FaWalking,
    iconColor: "#388E3C",
  },
  "Casual Running": {
    maxSpeed: 8,
    maxSpeedRadius: 7,
    handlingFactor: 8,
    powerFactor: 0.4, // kW
    weight: 70, // kg
    terrain: "flat",
    description: "Jogging",
    IconComponent: FaRunning,
    iconColor: "#FF9800",
  },
  "Competitive Running": {
    maxSpeed: 20,
    handlingFactor: 6,
    maxSpeedRadius: 20,
    powerFactor: 1.0, // kW
    weight: 70, // kg
    terrain: "varied",
    description: "Marathon running",
    IconComponent: FaRunning,
    iconColor: "#F57C00",
  },
  "Leisure Cycling": {
    maxSpeed: 25,
    maxSpeedRadius: 8,
    handlingFactor: 15,
    powerFactor: 0.3, // kW
    weight: 100, // kg (rider + bike)
    terrain: "urban",
    description: "Using city bikes for casual riding",
    IconComponent: FaBicycle,
    iconColor: "#2196F3",
  },
  "Sport Cycling": {
    maxSpeed: 35, // km/h
    maxSpeedRadius: 30,
    handlingFactor: 7,
    powerFactor: 0.6, // kW
    weight: 90, // kg (lighter road bike + rider)
    terrain: "road",
    description: "Using road bikes for more fit individuals",
    IconComponent: FaBicycle,
    iconColor: "#1976D2",
  },
  "Professional Cycling": {
    maxSpeed: 40,
    handlingFactor: 6,
    maxSpeedRadius: 40,
    powerFactor: 1.0, // kW
    weight: 85, // kg (racing bike + rider)
    terrain: "road",
    description: "Competitive cycling",
    IconComponent: FaBicycle,
    iconColor: "#0D47A1",
  },
  "Standard Motorcycling": {
    maxSpeed: 100,
    maxSpeedRadius: 150,
    handlingFactor: 5,
    powerFactor: 20, // kW
    weight: 200, // kg (motorcycle + rider)
    terrain: "road",
    description: "Regular motorcycles",
    IconComponent: FaMotorcycle,
    iconColor: "#9E9E9E",
  },
  "Sport Motorcycling": {
    maxSpeed: 160,
    maxSpeedRadius: 250,
    handlingFactor: 4,
    powerFactor: 50, // kW
    weight: 250, // kg (sports bike + rider)
    terrain: "road",
    description: "High-performance motorcycles",
    IconComponent: FaMotorcycle,
    iconColor: "#757575",
  },
  "Off-road Motorcycling": {
    maxSpeed: 80, // km/h
    handlingFactor: 7,
    maxSpeedRadius: 200,
    powerFactor: 25, // kW
    weight: 230, // kg (dirt bike + rider)
    terrain: "off-road",
    description: "Dirt bikes for rough terrain",
    IconComponent: FaMotorcycle,
    iconColor: "#795548",
  },
  "Gravel Moto-adventure": {
    maxSpeed: 85, // km/h
    handlingFactor: 4,
    maxSpeedRadius: 350,
    powerFactor: 40,
    weight: 300,
    terrain: "road",
    description: "Gravel rides on easy terrain",
    IconComponent: FaMotorcycle,
    iconColor: "#8D6E63",
  },
  "Standard Driving": {
    maxSpeed: 110,
    maxSpeedRadius: 400,
    handlingFactor: 4,
    powerFactor: 100, // kW
    weight: 1500, // kg (family car)
    terrain: "road",
    description: "Average family cars",
    IconComponent: FaCarSide,
    iconColor: "#3F51B5",
  },
  "Performance Driving": {
    maxSpeed: 190, // km/h
    maxSpeedRadius: 600,
    handlingFactor: 5,
    powerFactor: 300, // kW
    weight: 1400, // kg (sports car)
    terrain: "road",
    description: "Sports cars with high acceleration and top speeds",
    IconComponent: FaCarSide,
    iconColor: "#1A237E",
  },
};

export default travelModes;
