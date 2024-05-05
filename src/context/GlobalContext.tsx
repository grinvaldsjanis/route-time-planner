import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { reducer, initialState, GlobalState } from "./reducer";
import { Action } from "./actions";

interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}

const GlobalStateContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <GlobalStateContext.Provider value={value}>{children}</GlobalStateContext.Provider>;
};
