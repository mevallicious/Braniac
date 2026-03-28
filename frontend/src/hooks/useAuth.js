import { useContext,useCallback,useEffect } from "react";
import { AuthContext } from "../state/AuthContext";
import { register,login,logout,getMe } from "../api/auth.api";

export const useAuth = ()=>{
    const {user,setUser,isAuthLoading,setIsAuthLoading,isAuthenticated,setIsAuthenticated} = useContext(AuthContext)

    const handleRegister = async (userData) =>{
        try{
            const data = await register(userData)
            setUser(data.user)
            setIsAuthenticated(true)
            return data
        } catch(err){
            throw err.response?.data?.error || "Registeration failed"  
        }
    }


const handleLogin = async (credentials) => {
    try {
        const data = await login(credentials);
        setUser(data.user);
        setIsAuthenticated(true);
        return data; 
    } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        throw err.response?.data?.error || "Login failed. Check your credentials.";
    }
};


    const checkSession = useCallback(async () => {
       
        setIsAuthLoading(true); 
        try {
            const data = await getMe();
            setUser(data.user);
            setIsAuthenticated(true);
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsAuthLoading(false); 
        }
    }, [setUser, setIsAuthenticated, setIsAuthLoading]);
    

    useEffect(() => {
        if (!isAuthenticated) {
            checkSession();
        }
    }, [checkSession, isAuthenticated]);

    const handleLogOut = async () => {
        try {
            await logout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (err) {
            console.log("Logout glitch", err);
        }
    };


    return { 
        user, 
        isAuthenticated, 
        isLoading: isAuthLoading, 
        handleLogOut, 
        handleLogin, 
        handleRegister, 
        checkSession 
    };
};