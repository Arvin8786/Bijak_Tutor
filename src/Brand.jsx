import React from 'react';
import {JUNIOR} from './learningEditions.js';
import {SHELL_COPY} from './shellCopy.js';
export const APP_ICON='./icons/app-icon.svg';
/** One brand mark across every role, sign-in and the installed app. */
export default function Brand({subtitle='',compact=false,edition=JUNIOR}){
 return <span className={'bl-brand'+(compact?' bl-brand-compact':'')}><img className="bl-brand-icon" src={APP_ICON} width="52" height="52" alt=""/><span className="bl-brand-copy"><strong>BijakLearn <em>{edition.name.replace(/^BijakLearn /,'')}</em></strong>{subtitle&&<small>{subtitle}</small>}</span></span>;
}
export function BrandCredit({language='en'}){
 const copy=SHELL_COPY[language]||SHELL_COPY.en;
 return <small className="brand-credit">{copy.footerRights.replace('{year}',String(new Date().getFullYear()))}</small>;
}
export function PortalGlyph({name}){
 const paths={overview:'M12 2 22 9l-10 6L2 9z M4 13l8 5 8-5 M4 17l8 5 8-5',accounts:'m2 11 10-8 10 8 M5 10v11h14V10 M9 21v-6a3 3 0 0 1 6 0v6',enrolments:'M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4 M9 3h6v4H9z M8 14l3 3 5-6',tiers:'m2 8 10-5 10 5-10 5z M6 11v5q6 6 12 0v-5 M22 8v8',payments:'M3 5h18v14H3z M3 10h18 M7 15h3',offers:'m20 12-8 8-9-9V3h8l9 9Z M7 7h.01 M11 16l5-5',kasih:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',feedback:'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z',reports:'M4 20h16 M7 16V9 M12 16V4 M17 16v-5',enrol:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M17 11h6',membership:'M3 5h18v14H3z M3 10h18 M7 15h3',referrals:'M16 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M2 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M16 19a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M7.6 10.5l8.8-4 M7.6 13.5l8.8 4'};
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]||paths.overview}/></svg>;
}

const studySymbols=[
 ['🏠','m2 11 10-8 10 8 M5 10v11h14V10 M10 21v-7h4v7'],
 ['📚📖🔡','M2 5q5-2 10 2 5-4 10-2v14q-5-2-10 1-5-3-10-1z M12 7v13'],
 ['🧭🗺️🚀','M12 2a10 10 0 1 0 .01 0 M16 7l-2 7-7 3 3-8z'],
 ['📺','M2 5h20v14H2z M10 9l5 3-5 3z M9 22h6'],
 ['🧮','M3 3v18 M21 3v18 M3 7h18 M3 12h18 M3 17h18 M7 5v4 M11 10v4 M16 15v4'],
 ['🔬','m13 3 4 3-5 8-4-3z M15 12a5 5 0 0 1-2 9 M5 21h14 M4 16h7'],
 ['✂️🎨','M4 18 17 5l3 3L7 21H3z M15 7l3 3 M3 3l5 2-3 3z'],
 ['📝🎯','M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h4'],
 ['🧠🤖','M4 8h16v12H4z M12 8V4 M10 3h4 M7 12h2 M15 12h2 M9 16h6'],
 ['🎪🧩','m2 13 10-9 10 9z M4 13v8h16v-8 M10 21v-5h4v5'],
 ['💚','M12 21 3 12C-2 5 6 0 12 7c6-7 14-2 9 5z'],
 ['🎒','M5 9q0-5 7-5t7 5v12H5z M8 13h8v5H8z M10 4V2h4v2']
];
export function StudyGlyph({icon}){
 const drawing=studySymbols.find(([symbols])=>symbols.includes(icon));
 return drawing?<svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d={drawing[1]}/></svg>:icon;
}
