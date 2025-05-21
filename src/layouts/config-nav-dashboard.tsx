import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-home'),
  },
  {
    title: 'Students',
    path: '/dashboard/students',
    icon: icon('ic-user'),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },

  {
    title: 'Reports',
    path: '/dashboard/reports',
    icon: icon('ic-analytics'),
  },

  {
    title: 'Settings',
    path: '/dashboard/settings',
    icon: icon('ic-settings'),
  },
  {
    title: 'Logout',
    path: '/sign-in',
    icon: icon('ic-lock'),
    bottom: true,
  },
];

// Rutas que existen pero no se muestran en el menú
export const hiddenRoutes = [
  {
    title: 'Sign in',
    path: '/sign-in',
  },
  {
    title: 'Not found',
    path: '/404',
  },
];
