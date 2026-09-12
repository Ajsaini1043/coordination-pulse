import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "ok",
          service: "pulse",
          aiConfigured: Boolean(process.env["LOVABLE_API_KEY"]),
          time: new Date().toISOString(),
        });
      },
    },
  },
});
