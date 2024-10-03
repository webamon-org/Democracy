import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import { useAuth } from '../../AuthContext';

const AuthenticationPage = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [message, setMessage] = useState(''); // Message will show inside the Sign-Up dialog now
    const [openSignUpDialog, setOpenSignUpDialog] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signUpData, setSignUpData] = useState({ name: '', email: '', linkedin: '' });

    const navigate = useNavigate();
    const { setApiKey } = useAuth();

    const handleSignIn = async () => {
        try {
            setApiKey(apiKeyInput);
            setMessage('Sign-in successful!');
            navigate('/scans');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSignUp = async () => {
        if (!signUpData.name || !signUpData.email) {
            setMessage('All fields are required.');
            return;
        }

        if (!validateEmail(signUpData.email)) {
            setMessage('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('https://community.webamon.co.uk/signup', signUpData);

            if (response.status === 200) {
                setOpenSuccessDialog(true);
                setOpenSignUpDialog(false);
                // Reset the form data after successful sign-up
                setSignUpData({ name: '', email: '', linkedin: '' });
            }
        } catch (error) {
            setMessage(`Sign-up failed: ${error.response ? error.response.data.message : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpDialogClose = () => {
        setOpenSignUpDialog(false);
        // Clear form data when closing the dialog
        setSignUpData({ name: '', email: '', linkedin: '' });
        setMessage(''); // Clear any error or success message
    };

    return (
        <div className="login-page">
            <div className="logo-container">
                <img src={require('./logo.png')} alt="webamon-logo" className="logo" />
            </div>

            {/* Form Container */}
            <Container maxWidth="sm" className="auth-form">
                <TextField
                    label="Enter your API Key"
                    variant="outlined"
                    fullWidth
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />

                {/* Harmonized Button Styles with Gradients */}
                <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Button
                        variant="contained"
                        onClick={handleSignIn}
                        style={{
                            flexGrow: 1,
                            marginRight: '10px',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '12px',
                            backgroundImage: 'linear-gradient(135deg, #3b5998, #343b6f)', // Gradient for "Sign In"
                        }}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setOpenSignUpDialog(true)}
                        style={{
                            flexGrow: 1,
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '12px',
                            backgroundImage: 'linear-gradient(135deg, #4a90e2, #56CCF2)', // Gradient for "Sign Up"
                        }}
                    >
                        Sign Up
                    </Button>
                </div>

                {/* Adjusted Text Styles for Better Visibility */}
                <Typography variant="subtitle1" className="subtitle" style={{ marginBottom: '20px', fontWeight: '500', color: '#bbb' }}>
                    This is an open-source solution under the Apache 2.0 License.
                </Typography>

                {/* Lower Priority GitHub Button */}
                <Button
                    className="github-button"
                    onClick={() => window.open('https://github.com/webamon-org/Democracy', '_blank')}
                    style={{
                        width: '100%',
                        padding: '10px',
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: '14px',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        background: 'none',
                        borderBottom: '1px solid #444',
                    }}
                >
                    <GitHubIcon fontSize="large" style={{ marginRight: '8px' }} /> View on GitHub
                </Button>
            </Container>

            {/* Sign Up Dialog with Color Contrast Adjustments */}
            <Dialog open={openSignUpDialog} onClose={handleSignUpDialogClose}>
                <DialogTitle style={{ backgroundColor: '#131629', color: '#fff' }}>Join The Democracy - 1000x Daily API Calls</DialogTitle>
                <DialogContent style={{ backgroundColor: '#131629', color: '#fff' }}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb' } }} // Adjust text color
                        InputProps={{ style: { color: '#fff' } }} // Adjust input text color
                        style={{ marginBottom: '20px', backgroundColor: '#2a2d3e' }} // Dark input background
                    />
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb' } }} // Adjust text color
                        InputProps={{ style: { color: '#fff' } }} // Adjust input text color
                        style={{ marginBottom: '20px', backgroundColor: '#2a2d3e' }} // Dark input background
                    />
                    <TextField
                        label="LinkedIn Profile (Optional)"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.linkedin}
                        onChange={(e) => setSignUpData({ ...signUpData, linkedin: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb' } }} // Adjust text color
                        InputProps={{ style: { color: '#fff' } }} // Adjust input text color
                        style={{ marginBottom: '20px', backgroundColor: '#2a2d3e' }} // Dark input background
                    />

                    {/* Message displayed inside the Sign-Up dialog */}
                    {message && (
                        <Typography
                            variant="body1"
                            style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}
                        >
                            {message}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#131629' }}>
                    <Button
                        onClick={handleSignUp}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#555' : '#4a90e2',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '10px 20px',
                            backgroundImage: 'linear-gradient(135deg, #4a90e2, #343b6f)',
                        }}
                    >
                        {loading ? 'Submitting...' : 'Sign Up'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Dialog with Gradient Styling */}
            <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
                <DialogTitle style={{ backgroundColor: '#131629', color: '#fff' }}>Sign Up Successful</DialogTitle>
                <DialogContent style={{ backgroundColor: '#131629', color: '#fff' }}>
                    <Typography>Your signup request was successfully received! We will be in touch!</Typography>
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#131629' }}>
                    <Button
                        onClick={() => setOpenSuccessDialog(false)}
                        style={{
                            backgroundColor: '#4a90e2',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '10px 20px',
                            backgroundImage: 'linear-gradient(135deg, #4a90e2, #343b6f)', // Apply the same gradient
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AuthenticationPage;
