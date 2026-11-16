// Agentation annotation toolbar — development only.
// This site is static HTML (no React app), so the component is mounted standalone
// from esm.sh with pinned React 18. It never loads on the deployed site.
const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname) || location.protocol === 'file:';

if (isLocal) {
  const [{ default: React }, { createRoot }, { Agentation }] = await Promise.all([
    import('https://esm.sh/react@18.3.1'),
    import('https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1'),
    import('https://esm.sh/agentation@3.1.2?deps=react@18.3.1,react-dom@18.3.1'),
  ]);
  const host = document.createElement('div');
  host.id = 'agentation-root';
  document.body.appendChild(host);
  createRoot(host).render(React.createElement(Agentation));
}
