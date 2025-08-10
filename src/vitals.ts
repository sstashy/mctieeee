import { onCLS, onINP, onLCP, Metric } from 'web-vitals';

function report(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log('[Vitals]', metric.name, Math.round(metric.value));
  } else {
    try {
      navigator.sendBeacon?.('/vitals', JSON.stringify(metric));
    } catch {}
  }
}

onCLS(report);
onINP(report);
onLCP(report);
