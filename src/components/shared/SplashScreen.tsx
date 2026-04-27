export function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen w-full flex items-center justify-center px-4"
    >
      <div className="neo-card text-center max-w-sm w-full">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">
          Ember
        </p>
        <h1 className="text-4xl font-black tracking-tight">Habit Tracker</h1>
        <div className="mt-5 inline-block neo-tag">Loading...</div>
      </div>
    </div>
  );
}
