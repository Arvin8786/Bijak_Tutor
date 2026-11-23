import React, {useEffect, useRef, useState} from 'react';
import './release-updates.css';

const refreshParameter = 'bijak-release';
const dismissedKey = 'bijaklearn:dismissed-notices:v1';

export default function ReleaseUpdates({showNotices}) {
 const [notices, setNotices] = useState([]);
 const [stale, setStale] = useState(false);
 const dismissed = useRef(new Set());

 useEffect(() => {
  try {
   const saved = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
   if (Array.isArray(saved)) dismissed.current = new Set(saved);
  } catch {}

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
    if (showNotices && Array.isArray(latest.notices)) {
     setNotices(latest.notices.filter(notice => notice?.id && !dismissed.current.has(notice.id)));
    }
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
 }, [showNotices]);

 function dismiss() {
  notices.forEach(notice => dismissed.current.add(notice.id));
  try {
   localStorage.setItem(dismissedKey, JSON.stringify([...dismissed.current]));
  } catch {}
  setNotices([]);
 }

 if (stale) return <aside className="release-popup" aria-label="App update">
  <p>A new version is available.</p>
  <button type="button" onClick={() => window.location.reload()}>Refresh app</button>
 </aside>;
 if (!notices.length) return null;
 return <aside className="release-popup" aria-label="BijakLearn updates">
  <div className="release-popup-content" role="status">
   {notices.map(notice => <section key={notice.id}>
    <h2>{notice.title}</h2>
    <ul>{notice.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
   </section>)}
  </div>
  <button type="button" onClick={dismiss}>Got it</button>
 </aside>;
}
