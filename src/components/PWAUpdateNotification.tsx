import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

export const PWAUpdateNotification = () => {
  const [showReload, setShowReload] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error: Error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setShowReload(true);
    }
  }, [offlineReady, needRefresh]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowReload(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          {offlineReady ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-1">
                Готово за офлайн употреба
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Приложението е готово за работа без интернет връзка.
              </p>
              <Button size="sm" variant="outline" onClick={close}>
                Разбрах
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 mb-1">
                Налична е нова версия
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Обнови приложението за да получиш последните подобрения.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>
                  Обнови
                </Button>
                <Button size="sm" variant="ghost" onClick={close}>
                  По-късно
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
