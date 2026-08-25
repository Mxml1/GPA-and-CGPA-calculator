type GtagCommand = 'config' | 'event' | 'js';

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, targetId: string | Date, params?: GtagParams) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

export const isAnalyticsEnabled = Boolean(measurementId);

export const initAnalytics = () => {
  if (!measurementId || isInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  isInitialized = true;
};

export const trackPageView = (path: string, title = document.title) => {
  if (!measurementId || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path,
  });
};

export const trackEvent = (eventName: string, params: GtagParams = {}) => {
  if (!measurementId || !window.gtag) return;

  window.gtag('event', eventName, params);
};
