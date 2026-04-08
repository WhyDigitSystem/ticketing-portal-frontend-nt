// src/components/Loadable.js
import { Suspense } from 'react';

const Loadable = (Component) => (props) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;