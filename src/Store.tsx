import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { SimulatorParams, DEFAULTS } from './lib/types';
import { computeEngine, computePnL } from './lib/engine';

type Action = 
  | { type: 'SET_PARAM'; payload: { key: keyof SimulatorParams; value: any } }
  | { type: 'RESET' }
  | { type: 'LOAD'; payload: SimulatorParams };

function reducer(state: SimulatorParams, action: Action): SimulatorParams {
  switch (action.type) {
    case 'SET_PARAM':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'RESET':
      return { ...DEFAULTS };
    case 'LOAD':
      return action.payload;
    default:
      return state;
  }
}

interface StateContextType {
  params: SimulatorParams;
  dispatch: React.Dispatch<Action>;
  engineResult: ReturnType<typeof computeEngine>;
  pnlResult: ReturnType<typeof computePnL>;
  isCorporate: boolean;
  setIsCorporate: (val: boolean) => void;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [params, dispatch] = useReducer(reducer, DEFAULTS);
  const [isCorporate, setIsCorporate] = React.useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ijarah_v12_params');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD', payload: { ...DEFAULTS, ...parsed } });
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ijarah_v12_params', JSON.stringify(params)); } catch (e) { }
  }, [params]);

  const engineResult = useMemo(() => computeEngine(params), [params]);
  const pnlResult = useMemo(() => computePnL(engineResult), [engineResult]);

  return (
    <StateContext.Provider value={{ params, dispatch, engineResult, pnlResult, isCorporate, setIsCorporate }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useStateContext must be used within StateProvider');
  return context;
}
