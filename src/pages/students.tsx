import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

// se llama estudiantes pero importaremos los etilos de usuario
import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Users - ${CONFIG.appName}`}</title>
      </Helmet>

      <UserView />
    </>
  );
}