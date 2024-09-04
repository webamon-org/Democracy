import React, { useState } from "react";
import axios from 'axios';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReportDialog from '../../components/scanDialog.js';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  TextField,
  Typography,
  Switch,
  FormControlLabel, Tooltip, InputAdornment, IconButton
} from "@mui/material";
import { useAuth } from '../../AuthContext';

const ScanPage = () => {
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [validationError, setValidationError] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState('single');
  const [screenshotData, setScreenshotData] = useState(false);  // State variables for argparse arguments
  const [openDialog, setOpenDialog] = useState(false);
  const { apiKey } = useAuth();

  // New state to track environment toggle
  const [isCloud, setIsCloud] = useState(true); // Default is cloud

  const handleDomainChange = (event) => {
    setSubmission(event.target.value);
  };

  const handleToggleChange = (event) => {
    setIsCloud(event.target.checked);
  };

  const handleSubmit = async (event) => {
    setReport("");
    setError(false);
    event.preventDefault();

    setValidationError(false);

    try {
        setLoading(true);
        // Determine endpoint based on toggle state
        const endpoint = isCloud ? "https://community.webamon.co.uk/scan" : "http://localhost:5000/scan";

        const requestData = {
          'submission_url': submission,
        };

        const response = await axios.post(endpoint, requestData, {
          headers: {
            'x-api-key': apiKey
          },
        });

      if (response.status === 200) {
        const reportID = response.data.report_id;
        const searchEndpoint = `https://community.webamon.co.uk/report/${reportID}`;
        let searchResponse;
        let retryCount = 0;
        const maxRetries = 62;

        while (retryCount < maxRetries) {
          try {
            searchResponse = await axios.get(searchEndpoint, {
              headers: {
                'x-api-key': apiKey
              },
            });
            if (searchResponse.status === 200) {
              const screenshotResponse = await axios.get(`https://community.webamon.co.uk/screenshot/${reportID}`, {
                headers: {
                  'x-api-key': apiKey
                },
              });

              if (screenshotResponse.data.screenshot) {
                setScreenshotData(screenshotResponse.data.screenshot.screenshot);
              } else {
                setScreenshotData(false);
              }

              setReport(searchResponse.data.report);
              setOpenDialog(true);
              break;
            } else if (searchResponse.status === 404) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error('Unexpected response status');
            }
          } catch (error) {
            if (error.response && error.response.status === 404 && retryCount < maxRetries) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              setError(true);
              setErrorMessage(error.response.data.error || "An error occurred");
              break;
            }
          }
        }

        if (retryCount === maxRetries) {
          setError(true);
          setErrorMessage("Report not found in OpenSearch after multiple attempts.");
        }
      } else if (response.status === 500) {
        setErrorMessage(response.data.error || "An internal server error occurred");
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error submitting scan:", error);
      setError(true);
      setErrorMessage(error.response?.data?.error || error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReport('');
  };

  return (
    <Box
      style={{
        backgroundColor: "#191b2d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        minHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Toggle Button for Cloud/Local */}
      <Box
        sx={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isCloud}
              onChange={handleToggleChange}
              color="primary"
            />
          }
          label={isCloud ? "Cloud" : "Local"}
        />
      </Box>

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "600px" }}>
        <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <img
            src="/assets/footer-logo.png"
            alt="Logo"
            style={{
              width: `50%`,
              maxWidth: '100%',
            }}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <TabPanel value={tabValue} index="single">
            {validationError && (
              <Typography color="error">
                Enter a valid URL
              </Typography>
            )}
  <TextField
     label="Url or Domain"
     value={submission}
     onChange={handleDomainChange}
     variant="outlined"
     size="medium" // Default is medium; you can try large if needed
     fullWidth
     style={{ color: "#ffffff", marginBottom: "1rem" }}
     InputProps={{
       style: { fontSize: "1.3rem" }, // Increase input font size
       endAdornment: (
         <InputAdornment position="end">
           <Tooltip
             title="With or without https://"
             placement="top"
             arrow
           >
             <IconButton>
               <HelpOutlineIcon fontSize="large" />
             </IconButton>
           </Tooltip>
         </InputAdornment>
       ),
     }}
     InputLabelProps={{
       style: { fontSize: "1.1rem" },
     }}
   />
          </TabPanel>
        </Box>
<Button
  type="submit"
  disabled={loading}
  variant="contained"
  size="large"
  fullWidth
  style={{ backgroundColor: "#ffffff", color: "#343b6f", marginBottom: "1rem" }} // Set the background color here
>
  {loading ? (
    <CircularProgress style={{ color: "#343b6f", marginBottom: "1rem" }} size={32} />
  ) : (
    "Submit Scan"
  )}
</Button>


        {error && (
          <Box sx={{ marginBottom: "1rem" }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        )}
      </form>

      {report && (
        <ReportDialog
          open={openDialog}
          onClose={handleCloseDialog}
          rowData={report}
          screenshot={screenshotData}
        />
      )}
    </Box>
  );
};

// Custom TabPanel component for conditional rendering of tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default ScanPage;
