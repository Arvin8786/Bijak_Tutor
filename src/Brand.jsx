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
 const paths={overview:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',accounts:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',enrolments:'M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4 M9 3h6v4H9z M8 14l3 3 5-6',tiers:'M12 3 2 8l10 5 10-5-10-5 M2 12l10 5 10-5 M2 16l10 5 10-5',payments:'M3 5h18v14H3z M3 10h18 M7 15h3',offers:'m20 12-8 8-9-9V3h8l9 9Z M7 7h.01 M11 16l5-5',kasih:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',feedback:'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z',reports:'M4 20h16 M7 16V9 M12 16V4 M17 16v-5',enrol:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M17 11h6',membership:'M3 5h18v14H3z M3 10h18 M7 15h3',referrals:'M16 5a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M2 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M16 19a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M7.6 10.5l8.8-4 M7.6 13.5l8.8 4'};
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]||paths.overview}/></svg>;
}
