import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ReportsView } from 'src/sections/reports/view';

// ----------------------------------------------------------------------

export default function ReportsPage() {
  return (
    <>
      <Helmet>
        <title> {`Reportes - ${CONFIG.appName}`}</title>
      </Helmet>

      <ReportsView />
    </>
  );
}
