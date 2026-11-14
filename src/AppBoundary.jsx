import React from 'react';
export default class AppBoundary extends React.Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<main className="panel narrow" role="alert"><h1>Let’s reopen your learning space</h1><p>Something interrupted this activity. Your saved practice has not been cleared.</p><button type="button" onClick={()=>window.location.reload()}>Reopen BijakLearn</button></main>:this.props.children}
}
