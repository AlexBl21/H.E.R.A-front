import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
  loading?: boolean;
};

export function AnalyticsWebsiteVisitsReal({ title, subheader, chart, loading = false, ...other }: Props) {
  const theme = useTheme();

  const chartOptions = useChart({
    colors: [
      theme.palette.success.main,    // Verde
      theme.palette.warning.main,    // Naranja
      theme.palette.error.main,      // Rojo
      theme.palette.info.main,       // Azul claro
      '#9C27B0',                     // Púrpura
      '#FF5722',                     // Rojo-naranja
      '#795548',                     // Marrón
      '#607D8B',                     // Azul gris
    ],
    xaxis: {
      categories: chart.categories,
    },
    yaxis: {
      title: {
        text: 'Cantidad de Estudiantes',
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    ...chart.options,
  });

  if (loading) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={350}
      />
    </Card>
  );
}
