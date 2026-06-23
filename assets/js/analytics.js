    /***********************************************************
     * Google Analytics
     ***********************************************************/
    (function() {
      'use strict';

      const GA_MEASUREMENT_ID = 'G-NM5V8EXM44';
      const APP_NAME = 'Asphalt Yield Calculator';
      const TAB_TITLES = {
        yieldTab: 'Yield Calc',
        dataTab: 'Current Run / History',
        paverSpeedTab: 'Paver Speed Calc',
        projLengthTab: 'Projected Length Calc',
        tonnageTab: 'Tonnage Calc'
      };

      let lastTrackedPageLocation = '';

      function getGtag() {
        return typeof window.gtag === 'function' ? window.gtag : null;
      }

      function getTabTitle(tabId) {
        return TAB_TITLES[tabId] || 'App';
      }

      function getPageLocation(tabId) {
        const url = new URL(window.location.href);
        url.hash = tabId || '';
        return url.toString();
      }

      function trackPageView(tabId) {
        const gtag = getGtag();
        if (!gtag) return;

        const pageLocation = getPageLocation(tabId);
        if (pageLocation === lastTrackedPageLocation) return;

        lastTrackedPageLocation = pageLocation;
        const pageTitle = `${APP_NAME} - ${getTabTitle(tabId)}`;

        gtag('config', GA_MEASUREMENT_ID, {
          update: true,
          page_title: pageTitle,
          page_location: pageLocation
        });

        gtag('event', 'page_view', {
          send_to: GA_MEASUREMENT_ID,
          page_title: pageTitle,
          page_location: pageLocation
        });
      }

      function trackEvent(eventName, params = {}) {
        const gtag = getGtag();
        if (!gtag) return;

        gtag('event', eventName, {
          send_to: GA_MEASUREMENT_ID,
          app_name: APP_NAME,
          ...params
        });
      }

      window.HMAAnalytics = {
        measurementId: GA_MEASUREMENT_ID,
        trackEvent,
        trackPageView
      };

      document.addEventListener('DOMContentLoaded', () => {
        const activeTabId = document.querySelector('.tab-content.active')?.id || 'yieldTab';
        trackPageView(activeTabId);
      });

      window.addEventListener('appinstalled', () => {
        trackEvent('pwa_installed');
      });
    })();
