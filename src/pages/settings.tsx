import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings/view';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <>
      <Helmet>
        <title> {`Configuración - ${CONFIG.appName}`}</title>
      </Helmet>

      <SettingsView />
    </>
  );
}
