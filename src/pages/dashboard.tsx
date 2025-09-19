import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsViewReal } from 'src/sections/overview/view/overview-analytics-view-real';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Dashboard - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Dashboard de análisis de estudiantes con datos reales del sistema H.A.R.E"
        />
        <meta name="keywords" content="dashboard,estudiantes,analytics,rendimiento,riesgo" />
      </Helmet>

      <OverviewAnalyticsViewReal />
    </>
  );
}
