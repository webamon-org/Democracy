import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { Button, TextField, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for the API request
import './login.css';
import { useAuth } from '../../AuthContext'; // Import the useAuth hook

// AuthenticationPage Component
const AuthenticationPage = () => {
    const [apiKeyInput, setApiKeyInput] = useState(''); // State for the API key input
    const [message, setMessage] = useState('');
    const [openSignUpDialog, setOpenSignUpDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false); // State for managing success dialog
    const [signUpData, setSignUpData] = useState({
        name: '',
        email: '',
        linkedin: ''
    });
    const navigate = useNavigate();
    const { setApiKey } = useAuth(); // Get the setApiKey function from AuthContext

    const handleSignIn = async () => {
        try {
            // Here, you would typically validate the API key by sending a request to your backend
            // Assuming the API key is valid, we set it in the global state
            setApiKey(apiKeyInput);
            setMessage('Sign-in successful!');
            navigate('/scans'); // Redirect to the scans page
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

const handleSignUp = async () => {
    if (!signUpData.name || !signUpData.email || !signUpData.linkedin) {
        setMessage('All fields are required.');
        return;
    }

    if (!validateEmail(signUpData.email)) {
        setMessage('Please enter a valid email address.');
        return;
    }

    setLoading(true); // Set loading to true when the request starts

    try {
        const response = await axios.post('https://community.webamon.co.uk/signup', signUpData);

        if (response.status === 200) {
            setOpenSuccessDialog(true); // Open success dialog on successful signup
            setOpenSignUpDialog(false); // Close the signup dialog
        }
    } catch (error) {
        setMessage(`Sign-up failed: ${error.response ? error.response.data.message : error.message}`);
    } finally {
        setLoading(false); // Set loading to false when the request ends
    }
};
    const handleSignUpDialogOpen = () => {
        setOpenSignUpDialog(true);
    };

    const handleSignUpDialogClose = () => {
        setOpenSignUpDialog(false);
    };

    const handleSuccessDialogClose = () => {
        setOpenSuccessDialog(false);
        window.location.href = 'https://www.linkedin.com/company/web-a-mon/'; // Redirect to the desired link
    };

    const handleSignUpInputChange = (field, value) => {
        setSignUpData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };
 return (
        <div className="auth-page">
            <a>
                <img
                    alt="webamon-logo"
                    src={require('./footer-logo.png')}
                    style={{
                        cursor: 'pointer',
                        transform: 'scale(1.2)', // This scales the image to 120%
                        transformOrigin: 'center' // Ensures scaling happens from the center
                    }}
                />
            </a>
            <br />
            <Container maxWidth="sm" className="auth-form">
                <TextField
                    label="API Key"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSignIn}>
                    Sign In
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSignUpDialogOpen} style={{ marginLeft: '10px' }}>
                    Sign Up
                </Button>
                <Typography variant="body1" color="error" style={{ marginTop: '20px' }}>
                    {message}
                </Typography>
            </Container>

            <Dialog open={openSignUpDialog} onClose={handleSignUpDialogClose}>
                <DialogTitle>Sign Up</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={signUpData.name}
                        onChange={(e) => handleSignUpInputChange('name', e.target.value)}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={signUpData.email}
                        onChange={(e) => handleSignUpInputChange('email', e.target.value)}
                    />
                    <TextField
                        label="LinkedIn Profile"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={signUpData.linkedin}
                        onChange={(e) => handleSignUpInputChange('linkedin', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSignUpDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSignUp} color="primary">
                        Sign Up
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openSuccessDialog} onClose={handleSuccessDialogClose}>
                <DialogTitle>Sign Up Successful</DialogTitle>
                <DialogContent>
                    <Typography>
                        Your signup request was successfully received! Please allow up to 12 hours for review and account creation.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSuccessDialogClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};


export default AuthenticationPage;
