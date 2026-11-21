import React from 'react';
import {tx} from './i18n.js';
export default class AppBoundary extends React.Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<main className="panel narrow" role="alert"><h1>{tx("Let’s reopen your learning space")}</h1><p>{tx("Something interrupted this activity. Your saved practice has not been cleared.")}</p><button type="button" onClick={()=>window.location.reload()}>{tx("Reopen BijakLearn")}</button></main>:this.props.children}
}
