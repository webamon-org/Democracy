import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { useAuth } from '../../AuthContext';

const BugReport = () => {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const { apiKey } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus("Submitting...");

        try {
            await axios.post(
                "https://community.webamon.co.uk/bug",
                { message }, // Body content
                { // Configuration object
                    headers: {
                        'x-api-key': apiKey,
                    },
                }
            );
            setStatus("Feedback submitted successfully!");
            setMessage(""); // Clear the message after submission
        } catch (error) {
            console.error("Error submitting bug report:", error);
            setStatus("Failed to submit bug report. Please try again.");
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: 2,
            }}
        >
            <Typography variant="h4" gutterBottom>
                Please quickly tell us any feedback, bugs, features, anything!<br />
                The whole reason you are here is to use the box below.<br />
                Your feedback will directly influence actual output and solutions.<br />
                Thank you!
            </Typography>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 600, marginTop: "40px" }}>
                <TextField
                    label="Message"
                    multiline
                    rows={6}
                    variant="outlined"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <Box mt={2}>
                    <Button variant="contained" color="primary" type="submit" fullWidth>
                        Submit
                    </Button>
                </Box>
            </form>
            {status && (
                <Typography
                    variant="body1"
                    sx={{ mt: 2, color: status.includes("successfully") ? "green" : "red" }}
                >
                    {status}
                </Typography>
            )}
        </Box>
    );
};

export default BugReport;
