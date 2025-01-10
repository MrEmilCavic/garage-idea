import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(Cookies.get('token') || null);
    const [authenticated, setAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState({
        credId: '',
        email: '',
        avatar:''
    });

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                if (error.resposnse && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        }
    }, []);

    const tokenExpiry = (token, bufferTime = 300) => {
        if (!token) return true;
        try {
            const decodeToken = jwtDecode(token);
            const currently = Math.floor(Date.now()/1000);
            const expiry = decodeToken.exp;
            return expiry-currently < bufferTime;
        } catch (err) {
            console.err('Error checking token expiry time', err);
            return true;
        }
    };

    useEffect(() => {
        const storedToken = Cookies.get('token');
        if (storedToken) {
            setAuthenticated(true);
            fetchUserProfile(storedToken);
        } else {
            setAuthenticated(false);
            setUserProfile({});
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
        Cookies.set('token', newToken, { secure: true, sameSite: 'Strict' });
        setAuthenticated(true);
    };

    const logout = () => {
        setToken(null);
        Cookies.remove('token');
        setAuthenticated(false);
        setUserProfile({});
        window.location.reload();
    };

    const importAll = (i) => {
        let images = [];
        i.keys().forEach(item => images.push(i(item)));
        return images;
      };
      


    const fetchUserProfile = async (token) => {
        try {
            const decodeToken = jwtDecode(token);
            const credId = decodeToken.unique_name;
            const userMail = decodeToken.email;
            if (userMail) {
                const profileImages = importAll(require.context('./util', false, /\.(jpg)$/ ));
                const avatar = profileImages[Math.floor(Math.random()*profileImages.length)];
                setUserProfile ({
                    credId: credId,
                    email: userMail,
                    avatar: avatar
                });
            }
        } catch(err) {
            console.error('Something went wrong fetching the email or avatar', err);
            return;
        }
    };

    const updateUserProfile = (newProfile) => {
        setUserProfile(newProfile);
    };

    return (
        <AuthContext.Provider value={{ authenticated, token, login, logout, userProfile, fetchUserProfile, tokenExpiry, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

