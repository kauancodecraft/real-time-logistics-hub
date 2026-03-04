import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createVehicle,
  createDelivery,
  createRoute,
  createOperationalCost,
  getAllVehicles,
  getAllDeliveries,
  getDeliveriesByStatus,
  getDeliveriesByRegion,
  calculateOTD,
  calculateAverageDeliveryTime,
  calculateTotalRevenue,
  calculateTotalOperationalCosts,
} from "./db";

describe("Logistics Database Operations", () => {
  describe("Vehicles", () => {
    it("should create a vehicle", async () => {
      const uniquePlate = `TEST-${Date.now()}`;
      const result = await createVehicle({
        plate: uniquePlate,
        model: "Scania R440",
        capacity: 5000,
        fuelConsumption: 4.5,
        status: "available" as any,
        currentRegion: "São Paulo",
        totalKmRun: 0,
      });

      expect(result).toBeDefined();
    });

    it("should list all vehicles", async () => {
      const vehicles = await getAllVehicles();
      expect(Array.isArray(vehicles)).toBe(true);
      expect(vehicles.length).toBeGreaterThan(0);
    });
  });

  describe("Deliveries", () => {
    it("should create a delivery", async () => {
      const scheduledDate = new Date();
      const result = await createDelivery({
        trackingNumber: `TEST-${Date.now()}`,
        clientName: "Test Client",
        originCity: "São Paulo",
        destinationCity: "Rio de Janeiro",
        region: "Rio de Janeiro",
        weight: 500,
        value: "250.00" as any,
        status: "pending" as any,
        vehicleId: 1,
        scheduledDeliveryDate: scheduledDate,
      });

      expect(result).toBeDefined();
    });

    it("should list all deliveries", async () => {
      const deliveries = await getAllDeliveries();
      expect(Array.isArray(deliveries)).toBe(true);
    });

    it("should filter deliveries by status", async () => {
      const deliveries = await getDeliveriesByStatus("pending");
      expect(Array.isArray(deliveries)).toBe(true);
      deliveries.forEach((d) => {
        expect(d.status).toBe("pending");
      });
    });

    it("should filter deliveries by region", async () => {
      const deliveries = await getDeliveriesByRegion("São Paulo");
      expect(Array.isArray(deliveries)).toBe(true);
      deliveries.forEach((d) => {
        expect(d.region).toBe("São Paulo");
      });
    });
  });

  describe("Routes", () => {
    it("should create a route", async () => {
      const result = await createRoute({
        routeCode: `ROUTE-${Date.now()}`,
        vehicleId: 1,
        region: "São Paulo",
        totalDistance: 1000,
        totalDeliveries: 15,
        completedDeliveries: 0,
        status: "planned" as any,
        startDate: new Date(),
      });

      expect(result).toBeDefined();
    });
  });

  describe("Operational Costs", () => {
    it("should create an operational cost", async () => {
      const result = await createOperationalCost({
        vehicleId: 1,
        costType: "fuel" as any,
        amount: "250.50" as any,
        description: "Fuel cost",
        date: new Date(),
      });

      expect(result).toBeDefined();
    });
  });

  describe("KPI Calculations", () => {
    it("should calculate OTD", async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const otd = await calculateOTD(startDate, endDate);
      expect(typeof otd).toBe("number");
      expect(otd).toBeGreaterThanOrEqual(0);
      expect(otd).toBeLessThanOrEqual(100);
    });

    it("should calculate average delivery time", async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const avgTime = await calculateAverageDeliveryTime(startDate, endDate);
      const avgTimeNum = typeof avgTime === "string" ? parseFloat(avgTime) : avgTime;
      expect(typeof avgTimeNum).toBe("number");
      expect(avgTimeNum).toBeGreaterThanOrEqual(0);
    });

    it("should calculate total revenue", async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const revenue = await calculateTotalRevenue(startDate, endDate);
      expect(typeof revenue).toBe("number");
      expect(revenue).toBeGreaterThanOrEqual(0);
    });

    it("should calculate total operational costs", async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const costs = await calculateTotalOperationalCosts(startDate, endDate);
      expect(typeof costs).toBe("number");
      expect(costs).toBeGreaterThanOrEqual(0);
    });
  });
});
