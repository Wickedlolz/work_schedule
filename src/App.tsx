import { AuthProvider } from "./context/AuthContext";

import HomePage from "./components/HomePage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAUpdateNotification } from "./components/PWAUpdateNotification";

const App = () => {
  return (
    <AuthProvider>
      <HomePage />
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </AuthProvider>
  );
};

export default App;
