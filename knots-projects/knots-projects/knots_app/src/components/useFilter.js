
import * as React from 'react';
import { useState, useContext, useEffect, useCallback, useRef, useMemo, useReducer, createContext } from 'react'; 

export const useFilter = (FilterContext) => {
 const [filterContext, setFilterContext] = useState(useContext(FilterContext));
 const value = useMemo(() => [filterContext, setFilterContext], [filterContext])
 return value;
}