import React from 'react';
import {LEARNING_EDITIONS} from './learningEditions.js';

export default function LearningEditionList({active,onChange}){
 return <ul className="learning-edition-list" aria-label="Learning sections">
  {LEARNING_EDITIONS.map(edition=><li key={edition.id} data-edition={edition.id}>
   {onChange?
    <button type="button" aria-pressed={active===edition} onClick={()=>onChange(edition)}>
     <strong>{edition.name}</strong><span>{edition.label}</span>
    </button>:
    <><strong>{edition.name}</strong><span>{edition.label}</span></>}
  </li>)}
 </ul>;
}
