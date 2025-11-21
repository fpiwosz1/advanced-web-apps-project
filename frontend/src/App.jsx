import { useState } from "react";
import { AuthProvider } from "./auth/AuthContext";
import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SeriesForm from "./components/SeriesForm";
import MeasurementForm from "./components/MeasurementForm";
import MeasurementsPanel from "./components/MeasurementsPanel";
import Home from "./pages/Home";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [refreshSeriesKey, setRefreshSeriesKey] = useState(0);
  const [refreshMeasurementsKey, setRefreshMeasurementsKey] = useState(0);

  const refreshSeries = () => setRefreshSeriesKey((k) => k + 1);
  const refreshMeasurements = () => setRefreshMeasurementsKey((k) => k + 1);

  return (
    <AuthProvider>
      <Header
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCreateSeries={() => setSeriesOpen(true)}
        onOpenCreateMeasurement={() => setMeasurementOpen(true)}
      />
      <Home reloadKey={refreshSeriesKey} />
      <MeasurementsPanel
        reloadKey={refreshMeasurementsKey}
        onOpenCreate={() => setMeasurementOpen(true)}
      />

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SeriesForm
        open={seriesOpen}
        onClose={() => setSeriesOpen(false)}
        onCreated={refreshSeries}
      />
      <MeasurementForm
        open={measurementOpen}
        onClose={() => setMeasurementOpen(false)}
        onCreated={refreshMeasurements}
      />
    </AuthProvider>
  );
}
