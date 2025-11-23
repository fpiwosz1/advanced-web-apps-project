import { useState } from "react";
import { AuthProvider } from "./auth/AuthContext";
import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SeriesForm from "./components/SeriesForm";
import MeasurementForm from "./components/MeasurementForm";
import MeasurementsPanel from "./components/MeasurementsPanel";
import Home from "./pages/Home";
import ChangePasswordDialog from "./components/ChangePasswordDialog";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [refreshSeriesKey, setRefreshSeriesKey] = useState(0);
  const [refreshMeasurementsKey, setRefreshMeasurementsKey] = useState(0);

  const refreshMeasurements = () => setRefreshMeasurementsKey((k) => k + 1);

  const handleSeriesChanged = () => {
    setRefreshSeriesKey((k) => k + 1);
    setRefreshMeasurementsKey((k) => k + 1);
  };
  const [pwdOpen, setPwdOpen] = useState(false);

  return (
    <AuthProvider>
      <Header
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCreateSeries={() => setSeriesOpen(true)}
        onOpenCreateMeasurement={() => setMeasurementOpen(true)}
        onOpenChangePassword={() => setPwdOpen(true)}
      />
      <ChangePasswordDialog open={pwdOpen} onClose={() => setPwdOpen(false)} />
      <Home reloadKey={refreshSeriesKey} onChanged={handleSeriesChanged} />
      <MeasurementsPanel
        reloadKey={refreshMeasurementsKey}
        onOpenCreate={() => setMeasurementOpen(true)}
      />

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SeriesForm
        open={seriesOpen}
        onClose={() => setSeriesOpen(false)}
        onCreated={handleSeriesChanged}
      />
      <MeasurementForm
        open={measurementOpen}
        onClose={() => setMeasurementOpen(false)}
        onCreated={refreshMeasurements}
      />
    </AuthProvider>
  );
}
