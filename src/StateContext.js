import React, { useState, createContext } from 'react';

export const StateContext = createContext();

export const StateProvider = (props) => {
  const [rlyAccount, setRlyAccount] = useState();

  return <StateContext.Provider value={[rlyAccount, setRlyAccount]}>
    {props.children}
  </StateContext.Provider>
};