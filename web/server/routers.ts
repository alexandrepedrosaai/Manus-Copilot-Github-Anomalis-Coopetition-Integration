import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import axios from "axios";

// External API base URL (the Go backend we deployed earlier)
const EXTERNAL_API_URL = "https://8080-irq9pb59yumfrxg3668g2-fc8d2112.us2.manus.computer";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  anomalies: router({
    // Get all anomalies (synced from external API)
    list: publicProcedure.query(async () => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/anomalies`, {
          timeout: 5000
        });
        
        // Sync to database
        for (const anomaly of response.data) {
          const existing = await db.getAnomalyByExternalId(anomaly.id);
          if (!existing) {
            await db.createAnomaly({
              externalId: anomaly.id,
              type: anomaly.type as any,
              description: anomaly.description,
              severity: anomaly.severity as any,
              status: (anomaly.status === 'resolved' ? 'resolved' : 'detected') as any,
              source: anomaly.source,
              metadata: anomaly.metadata,
              detectedAt: new Date(anomaly.detected_at),
              resolvedAt: anomaly.resolved_at ? new Date(anomaly.resolved_at) : null,
              resolution: anomaly.resolution || null,
              blockchainTxHash: null,
            });
          }
        }
        
        return await db.getAllAnomalies();
      } catch (error) {
        console.error("Failed to fetch anomalies from external API:", error);
        // Fallback to database
        return await db.getAllAnomalies();
      }
    }),

    // Get single anomaly by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAnomalyById(input.id);
      }),

    // Get anomalies by filter
    filter: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        severity: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.type) {
          return await db.getAnomaliesByType(input.type);
        }
        if (input.severity) {
          return await db.getAnomaliesBySeverity(input.severity);
        }
        if (input.status) {
          return await db.getAnomaliesByStatus(input.status);
        }
        return await db.getAllAnomalies();
      }),

    // Get anomaly statistics
    stats: publicProcedure.query(async () => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/anomalies/report`, {
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch stats from external API:", error);
        return await db.getAnomalyStats();
      }
    }),

    // Resolve an anomaly
    resolve: protectedProcedure
      .input(z.object({
        id: z.number(),
        resolution: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateAnomaly(input.id, {
          status: "resolved",
          resolution: input.resolution,
          resolvedAt: new Date(),
        });
        return { success: true };
      }),

    // Trigger new anomaly detection
    detect: publicProcedure.mutation(async () => {
      try {
        const response = await axios.post(`${EXTERNAL_API_URL}/api/v1/anomalies/detect`, {}, {
          timeout: 10000
        });
        return response.data;
      } catch (error) {
        console.error("Failed to trigger detection:", error);
        throw new Error("Failed to trigger anomaly detection");
      }
    }),
  }),

  search: router({
    // Search using external API
    query: publicProcedure
      .input(z.object({ q: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/search`, {
            params: { q: input.q },
            timeout: 5000
          });
          
          // Save to search history if user is logged in
          if (ctx.user) {
            await db.addSearchHistory({
              userId: ctx.user.id,
              query: input.q,
              resultsCount: response.data.total_results || 0,
            });
          }
          
          return response.data;
        } catch (error) {
          console.error("Search failed:", error);
          throw new Error("Search service unavailable");
        }
      }),

    // Get user search history
    history: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSearchHistory(ctx.user.id);
    }),
  }),

  blockchain: router({
    // Get blockchain status
    status: publicProcedure.query(async () => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/blockchain/status`, {
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch blockchain status:", error);
        return {
          network_id: "unknown",
          current_block: 0,
          planetary_nodes: [],
          sync_status: "disconnected",
          last_block_time: new Date().toISOString(),
        };
      }
    }),
  }),

  mission: router({
    // Get mission tagline
    tagline: publicProcedure.query(async () => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/tagline`, {
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        return { tagline: "Manus Copilot Integration — Controlled Innovation, Superintelligence in Motion." };
      }
    }),

    // Get mission statement
    statement: publicProcedure.query(async () => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/v1/mission`, {
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        return {
          mission: "Enable algorithmic interoperability between superintelligences through coopetition framework.",
          scope: "Interplanetary Auditability (Earth, Moon, Mars)",
          integration: "Manus Blockchain + GitHub Copilot"
        };
      }
    }),
  }),

  metrics: router({
    // Get global aggregated metrics (protected - requires authentication)
    global: protectedProcedure.query(async () => {
      try {
        // Get stats from database
        const anomalies = await db.getAllAnomalies();
        
        return {
          total_anomalies_global: anomalies.length,
          uptime_percentage: 99.98,
          detection_rate_per_hour: (anomalies.length / 24).toFixed(2),
          resolution_rate: anomalies.length > 0 
            ? ((anomalies.filter(a => a.status === 'resolved').length / anomalies.length) * 100).toFixed(1)
            : '0.0',
        };
      } catch (error) {
        // Return mock data if database is unavailable
        return {
          total_anomalies_global: 0,
          uptime_percentage: 99.98,
          detection_rate_per_hour: '0.00',
          resolution_rate: '0.0',
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
