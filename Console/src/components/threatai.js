import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const getLLMResponse = async (prompt, onData) => {
  const responseText =  `
                         Coming soon!
                       `;

  for (let i = 0; i < responseText.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    onData(responseText[i]);
  }
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

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

      await getLLMResponse(userMessage.text, (char) => {
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
    <Box sx={{ width: '100%', maxWidth: "100%", margin: '0 auto', p: 2 }}>
      <Typography variant="h4" align="center" color="#f5f5f5" fontSize="36px" gutterBottom>
        Webamon Assist
      </Typography>
      <Paper sx={{ height: 600, overflowY: 'auto', p: 2, mb: 2 }}>
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
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
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
