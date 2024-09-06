/* eslint-disable react-refresh/only-export-components */
import  Hero  from "./components/Hero"
import Highlights from "./components/Highlights"
import Navbar from "./components/Navbar"

import * as Sentry from '@sentry/react';
function App ()  {

  return (
    //return  <button onClick={() => methodDoesNotExist()}>Break the world</button>;
  <main>
    <Navbar/>
    <Hero/>
    <Highlights/>
  </main>  
 );
};

export default Sentry.withProfiler(App);