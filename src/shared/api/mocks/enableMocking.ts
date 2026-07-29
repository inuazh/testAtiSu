export async function enableMocking(): Promise<void> {
  const { worker } = await import('./browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
