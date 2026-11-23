import React, {useEffect, useState} from 'react';
import './release-updates.css';

const refreshParameter = 'bijak-release';
export default function ReleaseUpdates() {
 const [stale, setStale] = useState(false);

 useEffect(() => {
  const release = __BIJAK_RELEASE__;
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get(refreshParameter) === release) {
   currentUrl.searchParams.delete(refreshParameter);
   history.replaceState(history.state, '', currentUrl);
  }

  let pending = false;
  let active = true;
  let registration;
  async function checkRelease() {
   if (pending || !navigator.onLine || document.visibilityState === 'hidden') return;
   pending = true;
   try {
    const response = await fetch(`${import.meta.env.BASE_URL}release.json?check=${Date.now()}`, {cache:'no-store'});
    if (!response.ok || !active) return;
    const latest = await response.json();
    if (!active || !/^[a-zA-Z0-9-]{4,30}$/.test(latest?.version || '')) return;
    if (latest.version !== release) {
     const url = new URL(window.location.href);
     if (url.searchParams.get(refreshParameter) === latest.version) {
      setStale(true);
      return;
     }
     url.searchParams.set(refreshParameter, latest.version);
     window.location.replace(url);
     return;
    }
    setStale(false);
   } catch {
    // The offline build keeps running when release metadata is unavailable.
   } finally {
    pending = false;
   }
  }

  function onOpen() {
   checkRelease();
   registration?.update().catch(() => {});
  }

  function onRestore(event) {
   if (event.persisted) onOpen();
  }

  if (window.isSecureContext && 'serviceWorker' in navigator) {
   navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {updateViaCache:'none'})
    .then(worker => { registration = worker; })
    .catch(() => {});
  }
  onOpen();
  window.addEventListener('pageshow', onRestore);
  window.addEventListener('online', onOpen);
  document.addEventListener('visibilitychange', onOpen);
  return () => {
   active = false;
   window.removeEventListener('pageshow', onRestore);
   window.removeEventListener('online', onOpen);
   document.removeEventListener('visibilitychange', onOpen);
  };
 }, []);

 if (stale) return <aside className="release-popup" aria-label="App update">
  <p>A new version is available.</p>
  <button type="button" onClick={() => window.location.reload()}>Refresh app</button>
 </aside>;
 return null;
}
