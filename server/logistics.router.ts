import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllVehicles,
  getAllDeliveries,
  getAllRoutes,
  getDeliveriesByStatus,
  getDeliveriesByRegion,
  getDeliveriesByDateRange,
  getCostsByVehicle,
  getCostsByDateRange,
  calculateOTD,
  calculateAverageDeliveryTime,
  calculateTotalRevenue,
  calculateTotalOperationalCosts,
} from "./db";

export const logisticsRouter = router({
  // ===== VEHICLES =====
  vehicles: router({
    list: publicProcedure.query(async () => {
      return await getAllVehicles();
    }),
  }),

  // ===== DELIVERIES =====
  deliveries: router({
    list: publicProcedure.query(async () => {
      return await getAllDeliveries();
    }),

    byStatus: publicProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return await getDeliveriesByStatus(input.status);
      }),

    byRegion: publicProcedure
      .input(z.object({ region: z.string() }))
      .query(async ({ input }) => {
        return await getDeliveriesByRegion(input.region);
      }),

    byDateRange: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return await getDeliveriesByDateRange(startDate, endDate);
      }),
  }),

  // ===== ROUTES =====
  routes: router({
    list: publicProcedure.query(async () => {
      return await getAllRoutes();
    }),
  }),

  // ===== OPERATIONAL COSTS =====
  costs: router({
    byVehicle: publicProcedure
      .input(z.object({ vehicleId: z.number() }))
      .query(async ({ input }) => {
        return await getCostsByVehicle(input.vehicleId);
      }),

    byDateRange: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return await getCostsByDateRange(startDate, endDate);
      }),
  }),

  // ===== KPIs =====
  kpis: router({
    otd: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const otd = await calculateOTD(startDate, endDate);
        return { otd: Math.round(otd * 100) / 100 };
      }),

    averageDeliveryTime: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const avgTime = await calculateAverageDeliveryTime(startDate, endDate);
        return { avgTime: Math.round(avgTime * 100) / 100 };
      }),

    totalRevenue: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const revenue = await calculateTotalRevenue(startDate, endDate);
        return { revenue };
      }),

    totalOperationalCosts: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const costs = await calculateTotalOperationalCosts(startDate, endDate);
        return { costs };
      }),

    dashboard: publicProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);

        const [otd, avgTime, revenue, costs, deliveries, vehicles] = await Promise.all([
          calculateOTD(startDate, endDate),
          calculateAverageDeliveryTime(startDate, endDate),
          calculateTotalRevenue(startDate, endDate),
          calculateTotalOperationalCosts(startDate, endDate),
          getAllDeliveries(),
          getAllVehicles(),
        ]);

        const deliveryStatusCount = {
          pending: deliveries.filter((d) => d.status === "pending").length,
          collected: deliveries.filter((d) => d.status === "collected").length,
          in_transit: deliveries.filter((d) => d.status === "in_transit").length,
          delivered: deliveries.filter((d) => d.status === "delivered").length,
          delayed: deliveries.filter((d) => d.status === "delayed").length,
          cancelled: deliveries.filter((d) => d.status === "cancelled").length,
        };

        const vehicleStatusCount = {
          available: vehicles.filter((v) => v.status === "available").length,
          in_transit: vehicles.filter((v) => v.status === "in_transit").length,
          maintenance: vehicles.filter((v) => v.status === "maintenance").length,
        };

        const profit = revenue - costs;

        return {
          otd: Math.round(otd * 100) / 100,
          avgTime: Math.round(avgTime * 100) / 100,
          revenue,
          costs,
          profit,
          deliveryStatusCount,
          vehicleStatusCount,
          totalDeliveries: deliveries.length,
          totalVehicles: vehicles.length,
        };
      }),
  }),
});
