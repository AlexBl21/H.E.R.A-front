import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ReportsView } from 'src/sections/reports/reportsView'; // Asegúrate de que la ruta sea correcta

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
