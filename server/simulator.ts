import { faker } from "@faker-js/faker";
import {
  createVehicle,
  createDelivery,
  createRoute,
  createOperationalCost,
  getAllVehicles,
  getAllDeliveries,
  updateDeliveryStatus,
  updateVehicleStatus,
  updateRouteStatus,
} from "./db";

const REGIONS = ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Santa Catarina"];
const CITIES: Record<string, string[]> = {
  "São Paulo": ["São Paulo", "Campinas", "Santos", "Sorocaba"],
  "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "Duque de Caxias"],
  "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem"],
  "Bahia": ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  "Santa Catarina": ["Florianópolis", "Blumenau", "Joinville"],
};

const VEHICLE_MODELS = ["Scania R440", "Volvo FH16", "Mercedes-Benz Actros", "Iveco Stralis"];
const COST_TYPES = ["fuel", "maintenance", "toll", "insurance", "salary"];

let simulatorRunning = false;

export async function initializeSimulator() {
  console.log("[Simulator] Initializing with base data...");

  try {
    // Create 5 vehicles
    for (let i = 0; i < 5; i++) {
      const plate = `ABC-${1000 + i}`;
      const model = VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];

      await createVehicle({
        plate,
        model,
        capacity: Math.floor(5000 + Math.random() * 5000),
        fuelConsumption: 3 + Math.random() * 2,
        status: "available" as any,
        currentRegion: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        totalKmRun: Math.floor(Math.random() * 100000),
      });
    }

    console.log("[Simulator] Vehicles initialized");

    // Create initial routes
    const vehicles = await getAllVehicles();
    for (const vehicle of vehicles) {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      await createRoute({
        routeCode: `RT-${Date.now()}-${vehicle.id}`,
        vehicleId: vehicle.id,
        region,
        totalDistance: Math.floor(500 + Math.random() * 1500),
        totalDeliveries: 10 + Math.floor(Math.random() * 20),
        completedDeliveries: 0,
        status: "planned" as any,
        startDate: new Date(),
      });
    }

    console.log("[Simulator] Routes initialized");

    // Create initial deliveries
    for (let i = 0; i < 50; i++) {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const citiesInRegion = CITIES[region] || CITIES["São Paulo"];
      const originCity = citiesInRegion[Math.floor(Math.random() * citiesInRegion.length)];
      const destinationCity = citiesInRegion[Math.floor(Math.random() * citiesInRegion.length)];

      const statuses = ["pending", "collected", "in_transit", "delivered"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7));

      await createDelivery({
        trackingNumber: `TRK-${Date.now()}-${i}`,
        clientName: faker.person.fullName(),
        originCity,
        destinationCity,
        region,
        weight: Math.floor(100 + Math.random() * 900),
        value: (Math.round((50 + Math.random() * 450) * 100) / 100).toString() as any,
        status: status as any,
        vehicleId: vehicles[Math.floor(Math.random() * vehicles.length)]?.id,
        scheduledDeliveryDate: scheduledDate,
        actualDeliveryDate: status === "delivered" ? new Date() : undefined,
      });
    }

    console.log("[Simulator] Deliveries initialized");
  } catch (error) {
    console.error("[Simulator] Initialization error:", error);
  }
}

export async function startSimulator() {
  if (simulatorRunning) {
    console.log("[Simulator] Already running");
    return;
  }

  simulatorRunning = true;
  console.log("[Simulator] Started");

  // Simulate every 10 seconds
  setInterval(async () => {
    try {
      await simulateOperations();
    } catch (error) {
      console.error("[Simulator] Error during simulation:", error);
    }
  }, 10000);
}

async function simulateOperations() {
  try {
    const vehicles = await getAllVehicles();
    const deliveries = await getAllDeliveries();

    // Update vehicle statuses and positions
    for (const vehicle of vehicles) {
      const statuses = ["available", "in_transit", "maintenance"];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const latitude = (-33.8688 + Math.random() * 10).toString();
      const longitude = (-51.2093 + Math.random() * 10).toString();
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

      await updateVehicleStatus(vehicle.id, newStatus, latitude, longitude, region);
    }

    // Update delivery statuses
    const pendingDeliveries = deliveries.filter((d) => d.status === "pending");
    if (pendingDeliveries.length > 0) {
      const randomDelivery = pendingDeliveries[Math.floor(Math.random() * pendingDeliveries.length)];
      await updateDeliveryStatus(randomDelivery.id, "collected");
    }

    const collectedDeliveries = deliveries.filter((d) => d.status === "collected");
    if (collectedDeliveries.length > 0) {
      const randomDelivery = collectedDeliveries[Math.floor(Math.random() * collectedDeliveries.length)];
      await updateDeliveryStatus(randomDelivery.id, "in_transit");
    }

    const inTransitDeliveries = deliveries.filter((d) => d.status === "in_transit");
    if (inTransitDeliveries.length > 0) {
      const randomDelivery = inTransitDeliveries[Math.floor(Math.random() * inTransitDeliveries.length)];
      const isDelayed = Math.random() > 0.85;
      await updateDeliveryStatus(randomDelivery.id, isDelayed ? "delayed" : "delivered", new Date());
    }

    // Add random operational costs
    if (Math.random() > 0.7) {
      const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const costType = COST_TYPES[Math.floor(Math.random() * COST_TYPES.length)];
      const amounts: Record<string, [number, number]> = {
        fuel: [100, 500],
        maintenance: [200, 1000],
        toll: [50, 200],
        insurance: [500, 2000],
        salary: [2000, 5000],
      };

      const [min, max] = amounts[costType];
      const amount = min + Math.random() * (max - min);

      await createOperationalCost({
        vehicleId: randomVehicle.id,
        costType: costType as any,
        amount: (Math.round(amount * 100) / 100).toString() as any,
        description: `${costType} for vehicle ${randomVehicle.plate}`,
        date: new Date(),
      });
    }

    console.log("[Simulator] Operations simulated at", new Date().toISOString());
  } catch (error) {
    console.error("[Simulator] Error in simulateOperations:", error);
  }
}

export function stopSimulator() {
  simulatorRunning = false;
  console.log("[Simulator] Stopped");
}
