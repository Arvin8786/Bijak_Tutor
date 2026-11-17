import React from 'react';
export default function MembershipPage({boot,live,onApply,onRefresh,onExplore}){
 return <section className="membership-journey"><div className="panel"><span className="mini-label">Learning for every family</span><h1>Choose your learning plan</h1><p>Access to each module is set by your administrator. Account approval and membership are managed separately.</p></div>
 <div className="membership-tiers">
  <article className="tier-card"><h2>Free</h2><p>A place to begin, with selected learning modules and a limited study library.</p><button onClick={onExplore}>Explore available learning</button></article>
  <article className="tier-card premium-tier"><h2>Premium</h2><p>Broader access to learning tools, practice and parent insights, according to your administrator’s module settings.</p><p>Contact your administrator to activate a paid membership. Payments are verified manually.</p></article>
  <article className="tier-card"><h2>Premium Kasih</h2><p>Community-sponsored learning access for families who need support. Tell us your circumstances and provide redacted supporting documents for private review.</p><button className="primary" onClick={onApply}>Apply for Premium Kasih</button></article>
 </div><section className="panel"><h2>Your membership</h2><p>Current plan: <strong>{boot?.access?.plan?.replaceAll('_',' ')||'FREE'}</strong></p>{boot?.access?.expiresAt&&<p>Expires: {new Date(boot.access.expiresAt).toLocaleDateString()}</p>}<p>Premium Kasih application: {boot?.scholarship||'Not submitted'}</p>{live?<button onClick={onRefresh}>Refresh account status</button>:<p>This is a learning demo. Family account enrolment and paid memberships are not active on this website. Applications and private documents are not submitted here.</p>}</section>
 </section>;
}
