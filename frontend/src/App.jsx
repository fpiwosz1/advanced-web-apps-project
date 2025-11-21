import { useState } from 'react';
import { AuthProvider } from './auth/AuthContext';
import Header from './components/Header';
import LoginDialog from './components/LoginDialog';
import SeriesForm from './components/SeriesForm';
import Home from './pages/Home';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshList = () => setRefreshKey((k) => k + 1);

  return (
    <AuthProvider>
      <Header
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCreateSeries={() => setSeriesOpen(true)}
      />
      {/* klucz wymusza ponowne pobranie listy po utworzeniu serii */}
      <div key={refreshKey}><Home /></div>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SeriesForm open={seriesOpen} onClose={() => setSeriesOpen(false)} onCreated={refreshList} />
    </AuthProvider>
  );
}
