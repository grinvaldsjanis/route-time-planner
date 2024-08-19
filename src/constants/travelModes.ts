export type TravelMode = keyof typeof travelModes;

const travelModes = {
  "Casual Walking": {
    maxSpeed: 5,
    handlingFactor: 1,
    powerFactor: 0.1,
    terrain: "flat",
    description: "Leisurely walking",
  },
  "Brisk Walking": {
    maxSpeed: 6.5,
    handlingFactor: 1,
    powerFactor: 0.15,
    terrain: "flat",
    description: "Fast walking",
  },
  "Casual Running": {
    maxSpeed: 8,
    handlingFactor: 0.8,
    powerFactor: 0.15,
    terrain: "flat",
    description: "Jogging",
  },
  "Competitive Running": {
    maxSpeed: 20,
    handlingFactor: 0.9,
    powerFactor: 0.2,
    terrain: "varied",
    description: "Marathon running",
  },
  "Leisure Cycling": {
    maxSpeed: 25,
    handlingFactor: 0.7,
    powerFactor: 0.4,
    terrain: "urban",
    description: "Using city bikes for casual riding",
  },
  "Sport Cycling": {
    maxSpeed: 35,
    handlingFactor: 1,
    powerFactor: 0.6,
    terrain: "road",
    description: "Using road bikes for more fit individuals",
  },
  "Professional Cycling": {
    maxSpeed: 40,
    handlingFactor: 1,
    powerFactor: 0.8,
    terrain: "road",
    description: "Competitive cycling",
  },
  "Standard Motorcycling": {
    maxSpeed: 100,
    handlingFactor: 1,
    powerFactor: 0.6,
    terrain: "road",
    description: "Regular motorcycles",
  },
  "Sport Motorcycling": {
    maxSpeed: 160,
    handlingFactor: 0.7,
    powerFactor: 1.3,
    terrain: "road",
    description: "High-performance motorcycles",
  },
  "Off-road Motorcycling": {
    maxSpeed: 80,
    handlingFactor: 1,
    powerFactor: 1.3,
    terrain: "off-road",
    description: "Dirt bikes for rough terrain",
  },
  "Moderate Gravel Ride": {
    maxSpeed: 90,
    handlingFactor: 0.8,
    powerFactor: 0.7,
    terrain: "road",
    description: "Smaller, less powerful cars",
  },
  "Standard Driving": {
    maxSpeed: 110,
    handlingFactor: 0.6,
    powerFactor: 0.8,
    terrain: "road",
    description: "Average family cars",
  },
  "Performance Driving": {
    maxSpeed: 190,
    handlingFactor: 1,
    powerFactor: 1.3,
    terrain: "road",
    description: "Sports cars with high acceleration and top speeds",
  },
};

export default travelModes;