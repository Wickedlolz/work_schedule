import SchedulePage from "./components/Schedule";
import { Toaster } from "./components/ui/sonner";

const App = () => {
  return (
    <main className="w-full max-w-screen overflow-x-auto px-2 sm:px-4">
      <SchedulePage />
      <Toaster />
    </main>
  );
};

export default App;
