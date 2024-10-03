import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import { useAuth } from '../../AuthContext';

const AuthenticationPage = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [message, setMessage] = useState('');
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
            }
        } catch (error) {
            setMessage(`Sign-up failed: ${error.response ? error.response.data.message : error.message}`);
        } finally {
            setLoading(false);
        }
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

                {/* Harmonized Button Styles */}
                <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Button
                        variant="contained"
                        onClick={handleSignIn}
                        style={{
                            flexGrow: 1,
                            marginRight: '10px',
                            backgroundColor: '#343b6f',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '12px',
                        }}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setOpenSignUpDialog(true)}
                        style={{
                            flexGrow: 1,
                            backgroundColor: '#4a90e2',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '12px',
                        }}
                    >
                        Sign Up
                    </Button>
                </div>

                <Typography variant="body1" className="error-message">
                    {message}
                </Typography>

                {/* Adjusted Text Styles for Better Visibility */}
                <Typography variant="subtitle1" className="subtitle" style={{ marginBottom: '20px', fontWeight: '500', color: '#bbb' }}>
                    This is an open-source project under the Apache 2.0 License.
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
            <Dialog open={openSignUpDialog} onClose={() => setOpenSignUpDialog(false)}>
                <DialogTitle style={{ backgroundColor: '#131629', color: '#fff' }}>Join The Democracy - Currently Closed Beta</DialogTitle>
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
                        }}
                    >
                        {loading ? 'Submitting...' : 'Sign Up'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
                <DialogTitle>Sign Up Successful</DialogTitle>
                <DialogContent>
                    <Typography>Your signup request was successfully received! We will be in touch!</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccessDialog(false)} color="primary">OK</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AuthenticationPage;
