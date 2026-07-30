export function isMockingEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_MOCKS !== 'false';
}

export async function enableMocking(): Promise<void> {
  if (!isMockingEnabled()) {
    return;
  }

  const { worker } = await import('./browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
