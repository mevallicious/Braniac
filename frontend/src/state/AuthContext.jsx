import React , {useState,useEffect, createContext, Children} from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    const value = {user,setUser,isAuthLoading,setIsAuthLoading,isAuthenticated,setIsAuthenticated}


  return (
    <AuthContext.Provider value={value}>
        { children }
    </AuthContext.Provider>
  )
}
