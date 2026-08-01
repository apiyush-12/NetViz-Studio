export type LandingAnalyticsEvent =
  | "landing_primary_cta_clicked"
  | "landing_secondary_cta_clicked"
  | "landing_protocol_preview_changed"
  | "landing_cidr_preview_used"
  | "landing_topology_cta_clicked"
  | "landing_lab_clicked"
  | "landing_login_clicked"
  | "landing_register_clicked"
  | "landing_dashboard_clicked"
  | "landing_faq_opened";

export function trackLandingEvent(event: LandingAnalyticsEvent, details?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  // Log in development or trigger custom analytics listener if registered
  if (process.env.NODE_ENV === "development") {
    // Standard dev logging without sensitive data
    console.log(`[NetViz Analytics] Event: ${event}`, details || "");
  }

  // Dispatch custom DOM event for decoupled telemetry
  const customEvent = new CustomEvent("netviz_analytics", {
    detail: { event, timestamp: Date.now(), ...details },
  });
  window.dispatchEvent(customEvent);
}
