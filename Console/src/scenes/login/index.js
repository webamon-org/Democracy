import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { Button, TextField, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for the API request
import './login.css';

// AuthenticationPage Component
const AuthenticationPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [openSignUpDialog, setOpenSignUpDialog] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false); // State for managing success dialog
    const [loading, setLoading] = useState(false); // Add loading state

    const [signUpData, setSignUpData] = useState({
        name: '',
        email: '',
        linkedin: ''
    });
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            await Auth.signIn(username, password);
            setMessage('Sign-in successful!');
            navigate('/scans'); // Redirect to /feeds/newly-registered on successful sign-in
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
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <DialogTitle>Join The Democracy</DialogTitle>
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
                    <Typography
                        variant="body1"
                        style={{ margin: '22px 0' }} // Adjust the margin to create spacing around the text
                    >
                        We ask for your linkedin profile as we expect the community to join with non-org emails. Putting a face and background to a user helps us. As this is a BETA will most likely ask you for feedback.
                    </Typography>
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
                    <Button
                        onClick={handleSignUp}
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Sign Up'}
                    </Button>

                </DialogActions>
            </Dialog>

            <Dialog open={openSuccessDialog} onClose={handleSuccessDialogClose}>
                <DialogTitle>Sign Up Successful</DialogTitle>
                <DialogContent>
                    <Typography>
                        Your signup request was successfully received! We will be in touch!
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
