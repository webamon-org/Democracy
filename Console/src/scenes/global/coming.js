import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ComingSoon = ({ logoSize = 50 }) => {
  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',

      }}
    >
      <Box>
        <img
          src="/assets/footer-logo.png"
          alt="Logo"
          style={{
            width: `${logoSize}%`,
            maxWidth: '100%',
            marginBottom: '20px',
          }}
        />
      </Box>
      <Typography variant="h3" gutterBottom>
        Coming Soon
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        We're working hard to bring something amazing. Stay tuned!
      </Typography>
    </Container>
  );
};

export default ComingSoon;
