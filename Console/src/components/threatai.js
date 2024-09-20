import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useAuth } from '../AuthContext';



const getLLMResponse = async (prompt, apiKey, onData) => {
  try {
    const response = await fetch('https://community.webamon.co.uk/threat-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (response.ok && data.reply) {
      for (let i = 0; i < data.reply.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        onData(data.reply[i]);
      }
    } else {
      onData('Error: No reply received');
    }
  } catch (error) {
    onData('Error: Unable to fetch response');
  }
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Using the useAuth hook inside a React component
  const { apiKey } = useAuth();

  const handleSend = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        text: inputValue,
        type: 'user',
      };
      setMessages([...messages, userMessage]);
      setInputValue(''); // Clear input field

      setLoading(true);
      let botMessage = {
        text: '',
        type: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Fetch the bot response and update the message, passing apiKey to getLLMResponse
      await getLLMResponse(userMessage.text, apiKey, (char) => {
        botMessage.text += char;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = { ...botMessage };
          return updatedMessages;
        });
      });

      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: "100%", margin: '0 auto', p: 2, }}>
      <Typography variant="h4" align="center" color="#f5f5f5" fontSize="36px" gutterBottom>
        Threat AI
      </Typography>
      <Paper sx={{ height: 600, overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: message.type === 'user' ? '#1976d2' : '#e0e0e0',
                  color: message.type === 'user' ? '#fff' : '#000',
                  borderRadius: '10px',
                  maxWidth: '90%',
                  marginLeft: message.type === 'user' ? 'auto' : '0',
                  fontSize: '1.25rem',
                }}
              >
                <ListItemText
                  primary={message.text}
                  primaryTypographyProps={{ fontSize: '1.5rem' }}  // Increased font size for chat text
                />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: 'flex' }}>
        <TextField
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your prompt..."
          sx={{ mr: 4, fontSize: '1.25rem' }}
          InputProps={{
            sx: { fontSize: '1.25rem', padding: 2 },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ fontSize: '1.25rem', padding: '12px 24px' }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBot;
