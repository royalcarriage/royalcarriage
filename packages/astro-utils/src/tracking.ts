export interface TrackingEvent {
  event: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  // Custom parameters
  [key: string]: any;
}

export function trackBookNowClick(target: string, location: string): TrackingEvent {
  return {
    event: 'book_now_click',
    eventCategory: 'Engagement',
    eventAction: 'Click',
    eventLabel: `${target} - ${location}`,
    button_location: location,
    site_target: target
  };
}

export function trackCallNowClick(target: string, location: string): TrackingEvent {
  return {
    event: 'call_now_click',
    eventCategory: 'Engagement',
    eventAction: 'Click',
    eventLabel: `${target} - ${location}`,
    button_location: location,
    site_target: target
  };
}

export function trackFormSubmit(target: string, formName: string): TrackingEvent {
  return {
    event: 'form_submit',
    eventCategory: 'Form',
    eventAction: 'Submit',
    eventLabel: `${target} - ${formName}`,
    form_name: formName,
    site_target: target
  };
}

export function trackPageView(target: string, pagePath: string, pageTitle: string): TrackingEvent {
  return {
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    site_target: target
  };
}

export function generateGASnippet(measurementId: string): string {
  return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>
`;
}

export function generateGTMSnippet(containerId: string): string {
  return `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->
`;
}

export function generateGTMNoScript(containerId: string): string {
  return `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;
}
