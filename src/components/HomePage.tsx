import { useAuth } from "@/hooks/useAuth";
import SchedulePage from "./Schedule";
import { Toaster } from "./ui/sonner";

const HomePage = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-screen overflow-x-auto px-2 sm:px-4 bg-[#F8F9FA]">
      <SchedulePage />
      <Toaster />
    </main>
  );
};

export default HomePage;
