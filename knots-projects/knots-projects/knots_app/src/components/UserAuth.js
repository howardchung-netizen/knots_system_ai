import React, { useEffect, useContext } from 'react'
import { useUserAuth } from '../helpers/hooks/useUserAuth';


export default function ({ children }) {
  return (
    <>
      {children}
    </>
  )
}
