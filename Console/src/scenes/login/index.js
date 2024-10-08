import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Checkbox } from '@mui/material';
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
    const [noBullshitMode, setNoBullshitMode] = useState(false); // Toggle state for No Bullshit mode
    const [willingToSpeak, setWillingToSpeak] = useState(false); // State for the checkbox

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
            setMessage('Full name & email');
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
                setWillingToSpeak(false); // Reset the checkbox
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
        setNoBullshitMode(false); // Reset the toggle when closing
        setWillingToSpeak(false); // Reset the checkbox
    };

    const handleNoBullshitToggle = (event) => {
        setNoBullshitMode(event.target.checked);
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

            {/* Sign Up Dialog with No Bulls**t Mode Toggle */}
            <Dialog open={openSignUpDialog} onClose={handleSignUpDialogClose}>
                <DialogTitle style={{ backgroundColor: '#131629', color: '#fff', textAlign: 'center', fontSize: '22px' }}>
                    Join The Democracy - 1000 Daily API Calls
                </DialogTitle>

                <DialogContent style={{ backgroundColor: '#131629', color: '#fff' }}>
                    {/* No Bullshit Mode Switch */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={noBullshitMode}
                                onChange={handleNoBullshitToggle}
                                color="primary"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#4a90e2',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#ff4d4d',
                                    },
                                    '& .MuiSwitch-switchBase': {
                                        color: '#56CCF2',
                                    },
                                    '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                                        backgroundColor: '#ff6f6f',
                                    },
                                }}
                            />
                        }
                        label="No Bullsh*t Mode"
                        style={{ marginBottom: '20px', color: '#fff'}}
                    />

                    {/* Input Fields */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb', fontSize: "18px" } }}
                        InputProps={{ style: { color: '#fff' } }}
                        style={{ marginBottom: '20px', backgroundColor: '#2a2d3e'  }}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb', fontSize: "18px" } }}
                        InputProps={{ style: { color: '#fff' } }}
                        style={{ marginBottom: '20px', backgroundColor: '#2a2d3e' }}
                    />
                    <TextField
                        label="LinkedIn Profile (Optional)"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signUpData.linkedin}
                        onChange={(e) => setSignUpData({ ...signUpData, linkedin: e.target.value })}
                        InputLabelProps={{ style: { color: '#bbb', fontSize: "18px" } }}
                        InputProps={{ style: { color: '#fff' } }}
                        style={{ marginBottom: '10px', backgroundColor: '#2a2d3e' }}
                    />

                    {/* Willing to Speak to Founder Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={willingToSpeak}
                                onChange={(e) => setWillingToSpeak(e.target.checked)}
                                style={{ color: '#4a90e2' }}
                            />
                        }
                        label="Willing to speak to our founder or provide feedback (required)"
                        style={{ color: '#fff', marginTop: '5px' }}
                    />

                    {/* Error Message */}
                    {message && (
                        <Typography
                            variant="body1"
                            style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}
                        >
                            {message}
                        </Typography>
                    )}
                </DialogContent>

                {/* Sign Up Button */}
                <DialogActions style={{ backgroundColor: '#131629', justifyContent: 'right', padding: '20px' }}>
                    <Button
                        onClick={handleSignUp}
                        disabled={loading || !willingToSpeak}  // Disable if checkbox is not checked
                        style={{
                            backgroundColor: noBullshitMode ? '#ff4d4d' : loading || !willingToSpeak ? '#555' : '#4a90e2',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '10px 20px',
                            fontSize: '16px',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                            backgroundImage: noBullshitMode
                                ? 'linear-gradient(135deg, #ff4d4d, #ff6f6f)'
                                : 'linear-gradient(135deg, #4a90e2, #343b6f)',
                        }}
                    >
                        {loading ? 'Submitting...' : 'Sign Up'}
                    </Button>
                </DialogActions>

  {/* No Bullshit Message - Rendered Beneath the Button */}
  {noBullshitMode && (
    <DialogContent style={{ backgroundColor: '#1b2135', padding: '15px 20px', color: '#fff', borderTop: '1px solid #4a90e2' }}>
      <Typography
        variant="body1"
        style={{
          backgroundColor: '#1b2135',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#bbb',
        }}
      >
        - We are a startup & 100% in house<br />
        - We are seeking early adopters to influence the solution<br />
        - No guardrails: Non-attributable accounts will not be permitted<br />
        - Q1/25 goal: Build Infra for daily snapshots of the entire web<br /><br />
        - Post-snapshots, we will identify:<br />
        &nbsp;&nbsp;1) Critical, exploitable hosted dependencies consumed by the majority<br />
        &nbsp;&nbsp;2) Tracking Threat Actors across the web like never before<br />
        &nbsp;&nbsp;3) And soo much more<br /><br />
      </Typography>
    </DialogContent>
  )}
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
