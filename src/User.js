import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';



function User () {
    const [signUpData, setSignUpData] = useState({
        credentials:'',
        secret:'',
        confirmPassword:''
    });
    const [signInData, setSignInData] = useState({
        credentials: '',
        secret: ''
    });

    const { login, logout, authenticated, userProfile } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [alert, setAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const handleChange = (e, setData) => {
        const { name, value } = e.target;
        setData(prevData => ({
            ...prevData,
            [name] : value
        }));
    };

    const handleToggle = (setStatus) => {
        setStatus(prevState => !prevState);
    };

    const emailCheck = (credentials) => {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(credentials)) {
            setError('Please use a valid e-mail address!');
            return;
        }
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        const { credentials, secret, confirmPassword } = signUpData;
        if(!credentials) {
            setError('Please fill in your e-mail address');
            return;
        }
        emailCheck(credentials);
        if (secret !== confirmPassword) {
            setError('Careful now! The passwords you entered do not match');
            console.log(error);
            return;
        }

        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.post(`${apiUrl}/api/SignUp/register`, signUpData);
            if (response.status === 200) {
                setSuccess('Sign-up successful, welcome to the community!');
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
                setLoading(false);
                setError('');
                setSignUpData({
                    userIdentification: '',
                    secret: '',
                    confirmPassword: ''
                })
            };
        } catch (error) {
            console.error('Error signing up: ', error);
            setError('Aiaiai! Something went wrong during signing up. Please contact us!');
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        const { credentials, secret } = signInData;
        if(!credentials) {
            setError('Please fill in your e-mail address');
            console.log(error);
            return;
        }
        emailCheck(credentials);
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.post(`${apiUrl}/signin`, signInData);
            if (response.status === 200) {
                const token = response.data.token;
                login(token);
                setSignUpData({
                    credentials: '',
                    secret: ''
                });
                setSuccess('Sign-in successful, welcome back!');
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
                setError('');
                } else {
                    setError('Sign in unsuccesful, try using your correct email and password (:');
                };
            }
            catch (error) {
            console.error('Error signing in: ', error);
            setError('This is strange... Something went wrong signing you in');
            } finally {
                setLoading(false);
        }
    };

    return (
        <div id="User" className="bg-primary text-text-primary py-4 px-6">
            {alert &&  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white text-green-600 px-4 py-2 rounded-lg shadow-md opacity-100 transition-opacity duration-1000 ease-out"
                            style={{ transition: "opacity 1s ease-out" }}>
                            {success}
                        </div>
            }
            {!authenticated &&
            <section id="signUp" className="container mx-auto flex justify-center items-center flex-col">
            {!showSignUp && 
            <h2 className="text-2xl p-6 text-secondary font-bold cursor-pointer hover:text-accent" onClick={(e) => handleToggle(setShowSignUp)}>Is it your first time? We are happy to welcome you!{'->'} </h2>}
            {showSignUp &&
                <div id="signUpForm flex flex-col justify-end items-center">
                    <h4 className="text-2xl font-bold py-6">Let's get you started:</h4>
                    {error && <p className="flex text-red-600 bg-white rounded-xl shadow-lg p-6 mb-6">Error: {error}</p>}
                    <form onSubmit={handleSignUp}>
                        <div className="bg-white text-secondary rounded-xl shadow-lg p-6 mb-6">
                            <label htmlFor="email" className="block font-medium mb-2"> e-mail: </label>
                            <input type="text" className="rounded-md" name="credentials" value={signUpData.credentials} onChange={(e) => handleChange(e, setSignUpData)} />
                            <label htmlFor="password" className="block font-medium mb-2"> Password: </label>
                            <input type="password" className="rounded-md" name="secret" value={signUpData.secret} onChange={(e) => handleChange(e, setSignUpData)} />
                            <label htmlFor="confirmPassword" className="block  font-medium mb-2"> Confirm Password: </label>
                            <input type="password" className="rounded-md" name="confirmPassword" value={signUpData.confirmPassword} onChange={(e) => handleChange(e, setSignUpData)} />
                        </div>
                        <button type="submit" disabled={loading} 
                            className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent">
                            Sign me up!
                        </button>
                    </form>
                    <p className="flex justify-center text-xl text-secondary font-bold cursor-pointer hover:text-accent py-6" onClick={(e) => handleToggle(setShowSignUp)}>{'<-'} Close</p>
                </div>
            }
            </section>
            }
            {!authenticated && !showSignUp &&
                <section id="signIn" className="container mx-auto flex flex-col justify-center items-center py-6">
                {error && <p className="text-red-600 bg-white rounded-xl shadow-lg p-6 mb-6">Error: {error}</p>}
                <form onSubmit={handleSignIn}>
                    <div className="bg-white text-secondary rounded-xl shadow-lg p-6 mt-6">
                        <label htmlFor="email" className="block text-secondary font-medium mt-2"> e-mail: </label>
                        <input type="text" className="rounded-md" name="credentials" value={signInData.credentials} onChange={(e) => handleChange(e, setSignInData)} />
                        <label htmlFor="password" className="block text-secondary font-medium mt-2"> Password: </label>
                        <input type="password" className="rounded-md" name="secret" value={signInData.secret} onChange={(e) => handleChange(e, setSignInData)} />
                    </div>
                    <button type="submit" disabled={loading} className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent">
                        Sign me in!
                        </button>
                </form>
            </section>
            }
            {authenticated &&
                <section id="profileInfo" className="flex flex-col items-end px-4 m-4">
                    <p className="flex flex-row items-center ml-2 mb-4 text-secondary">
                        {userProfile.email}
                        <img src={userProfile.avatar}  className="w-20 h-auto rounded-full ml-4"  alt="your avatar" />
                    </p>
                    <span onClick={logout} className="flex text-center cursor-pointer px-2 mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent">logout</span>
                </section>
            }
        </div>
    );
}

export default User;
