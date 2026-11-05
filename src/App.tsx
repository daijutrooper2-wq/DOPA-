import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // If the game scripts are already loaded and screen-container is empty, render the opening screen
    const timer = setTimeout(() => {
      const screenContainer = document.getElementById('screen-container');
      if (screenContainer && screenContainer.children.length === 0) {
        if (typeof (window as any).renderOpeningScreen === 'function') {
          const playerState = (window as any).playerState;
          if (playerState?.skipOpening && !playerState?.isFirstTime) {
            (window as any).renderOpeningScreen(5);
          } else {
            (window as any).renderOpeningScreen(1);
          }
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 縦画面時の警告オーバーレイ */}
      <div id="orientation-warning" className="fixed inset-0 bg-slate-950 z-[9999] flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4 animate-bounce">📱🔄</div>
        <h2 className="text-xl font-bold text-amber-400 mb-2 font-pixel">横画面でお楽しみください</h2>
        <p className="text-sm text-slate-300">このゲームは横画面専用です。<br />デバイスを横向きに回転させてください。</p>
      </div>

      <div id="app" className="w-full h-full flex flex-col justify-between pixel-box-dark relative overflow-hidden p-2 sm:p-4">
        {/* DYNAMIC CONTENT CONTAINER */}
        <main id="screen-container" className="flex-1 flex flex-col justify-start items-center w-full relative overflow-y-auto pt-6">
          {/* Screen content injected via JS */}
        </main>
      </div>

      {/* MODAL / NOTIFICATION OVERLAY */}
      <div id="modal-overlay" className="fixed inset-0 bg-black/85 hidden flex items-center justify-center p-2 sm:p-4 z-[9995]">
        <div className="pixel-box bg-slate-900 max-w-md w-full p-3 sm:p-5 text-center relative border-amber-400 max-h-[90vh] flex flex-col">
          <h3 id="modal-title" className="text-base sm:text-xl font-bold text-amber-400 mb-2 sm:mb-3 font-pixel"></h3>
          <div id="modal-body" className="text-slate-200 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-[60vh] overflow-y-auto text-left flex-1 pr-1"></div>
          <div id="modal-actions" className="flex justify-center gap-3">
            <button onClick={() => (window as any).closeModal?.()} className="pixel-btn pixel-btn-primary px-6 py-2 font-bold text-sm">閉じる</button>
          </div>
        </div>
      </div>

      {/* SETTINGS SLIDE-IN PANEL */}
      <div id="settings-backdrop" className="fixed inset-0 bg-black/75 hidden z-[9996] transition-opacity" onClick={() => (window as any).closeSettingsPanel?.()}></div>
      <div id="settings-slide-panel" className="fixed inset-y-0 right-0 z-[9997] w-1/2 bg-slate-900 border-l-4 border-amber-500 shadow-2xl transform translate-x-full transition-transform duration-300 ease-out flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-amber-600/50 pb-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-amber-400 font-pixel">⚙️ 設定パネル</h3>
          <button onClick={() => (window as any).closeSettingsPanel?.()} className="pixel-btn pixel-btn-danger px-3 py-1 text-xs font-bold">✕ 閉じる</button>
        </div>
        <div id="settings-panel-body" className="flex-1 space-y-3 text-xs text-slate-200">
        </div>
      </div>
    </>
  );
}
