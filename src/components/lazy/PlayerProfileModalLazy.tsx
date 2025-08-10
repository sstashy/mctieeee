import React from 'react';
export const PlayerProfileModalLazy = React.lazy(
  () => import('../modals/PlayerProfileModal.jsx'), // Yol farklıysa düzelt
);
