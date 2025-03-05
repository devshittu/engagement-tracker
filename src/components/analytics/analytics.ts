'use client';

// Minimal amplitude/posthog snippet. Replace with actual config.
export function trackPageModeEvent(eventName: string) {
  // e.g., amplitude.getInstance().logEvent(eventName);
  // or posthog.capture(eventName);
  console.log(`[Analytics] Tracking event: ${eventName}`);
}
