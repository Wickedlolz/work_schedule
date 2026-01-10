import { AuthProvider } from "./context/AuthContext";

import HomePage from "./components/HomePage";

const App = () => {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
};

export default App;
