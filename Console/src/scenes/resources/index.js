import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Select, MenuItem, IconButton, FormControl, InputLabel, CircularProgress, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../components/Header';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import debounce from 'lodash.debounce';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
});

const AssetsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for managing active tab
  const [filters, setFilters] = useState({});
  const [statusColor, setStatusColor] = useState(''); // State for status color
  const { apiKey } = useAuth();

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value.trim() !== '') {
        params.append(key, value);
      }
    }

    return params.toString();
  };

  function a11yProps(index) {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <Box
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
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

  const fetchAssets = async (filterParams) => {
    setLoading(true);
    setStatusColor('yellow'); // Set status color to yellow when loading

    try {
      const queryParams = buildQueryParams();
      const response = await axiosInstance.get(`/resource?${queryParams}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      // Set status color based on response status
      if (response.status === 200) {
        setStatusColor('green');
      }

      const mappedResults = response.data.resources.map((hit) => ({
        ...hit,
      }));

      setResults(mappedResults);
    } catch (err) {
      // Set status color based on error response status
      if (err.response) {
        if (err.response.status === 400) {
          setStatusColor('blue');
        } else if (err.response.status >= 500) {
          setStatusColor('red');
        }
      } else {
        setStatusColor('red'); // General error handling
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const debouncedFetchAssets = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedFetchAssets();

    // Clean up the debounce on unmount
    return () => {
      debouncedFetchAssets.cancel();
    };
  }, [filters]);

  const handleFilterChange = (key, value) => {
  setStatusColor('yellow');
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
  setStatusColor('yellow');
    setFilters({});
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = async (rowData) => {
  setLoading(true)
    setSelectedRow(rowData);
    setStatusColor('yellow'); // Set status color to yellow when fetching

    try {
      const response = await axiosInstance(`https://community.webamon.co.uk/resource/${rowData.id}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      const { resource, mime_type } = response.data.resource; // Extract rawData and mime from response
      if (['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(mime_type)) {
        if (mime_type === 'image/gif') {
          setRawData(resource);
        } else {
          setRawData(`data:${mime_type};base64,${resource}`);
        }
      } else {
        // For non-image types, set rawData as is
        setRawData(resource);
      }
setLoading(true)
      setOpenDialog(true);
      setStatusColor('green');
    } catch (err) {
      // Set status color based on error response status
      setLoading(false)
      if (err.response) {
        if (err.response.status === 400) {
          setStatusColor('blue');
        } else if (err.response.status >= 500) {
          setStatusColor('red');
        }
      } else {
        setStatusColor('red'); // General error handling
      }
      console.error('Error fetching rawData:', err);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData(''); // Clear rawData when closing the dialog
  };

  const columns = [
       {
            field: 'expand',
            headerName: '',
            flex: 0.05,
            sortable: false,
            renderCell: (params) => (
              <Tooltip title="Click for more info">
                <IconButton>
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            ),
          },
    { field: 'mime_type', headerName: 'Type', flex: 0.3, filterable: true },
    { field: 'sha256', headerName: 'SHA256', flex: 0.6, filterable: true },
    { field: 'date', headerName: 'First Seen', flex: 0.2, filterable: true },
    { field: 'hits', headerName: 'Hits', flex: 0.2, filterable: true },
    { field: 'malicious', headerName: 'Malicious', flex: 0.1, filterable: true },
    { field: 'tag', headerName: 'Tag', flex: 0.3, filterable: true },

  ];

  // Map status color to text for the tooltip
  const statusText = {
    green: 'Success',
    blue: 'No Results',
    red: '5xx Server Error',
    yellow: 'Loading...',
    '': 'Idle',
  };

  return (
    <Box m="20px">
      <Header title="RESOURCES" subtitle="Web Assets Discovered During Scans" />
      <Box m="40px 0 0 0" height="75vh">
        {/* Container for the buttons and status color indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '20px' }}>
               {/* Status color indicator with tooltip */}
               <Tooltip title={statusText[statusColor] || 'Unknown Status'}>
                 <Box
                   sx={{
                     width: '20px',
                     height: '20px',
                     borderRadius: '50%',
                     backgroundColor: statusColor,
                     marginRight: '10px',
                     border: '1px solid #ddd',
                     cursor: 'pointer'
                   }}
                 />
               </Tooltip>
                         {loading && <CircularProgress size={20} sx={{ color: '#ffffff' }} />} {/* Set inline color */}

               <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleClearFilters} style={{ backgroundColor: "#ffffff", color: "#343b6f", marginLeft: "10px", fontSize: "16px" }}>
                  Clear Filters
                </Button>
                <Button variant="contained" color="primary" onClick={fetchAssets} style={{ backgroundColor: "#ffffff", color: "#343b6f", marginLeft: "10px", fontSize: "16px"  }}>
                  Refresh
                </Button>
               </Box>
               </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="SHA256"
            variant="outlined"
            value={filters.sha256 || ''}
            onChange={(e) => handleFilterChange('sha256', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="TAG"
            variant="outlined"
            value={filters.tag || ''}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="COUNTRY"
            variant="outlined"
            value={filters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="SERVING IP"
            variant="outlined"
            value={filters.serving_ip || ''}
            onChange={(e) => handleFilterChange('serving_ip', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
            <InputLabel>WHITELISTED</InputLabel>
            <Select
              label="whitelisted"
              value={filters.white_listed || ''}
              onChange={(e) => handleFilterChange('white_listed', e.target.value)}
            >
                          <MenuItem value="All">All</MenuItem>
                          <MenuItem value="true">True</MenuItem>
                          <MenuItem value="false">False</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="NOTES"
                        variant="outlined"
                        value={filters.notes || ''}
                        onChange={(e) => handleFilterChange('notes', e.target.value)}
                        sx={{ mr: '10px' }}
                      />
                      <TextField
                        label="Type (MIME)"
                        variant="outlined"
                        value={filters.mime_type || ''}
                        onChange={(e) => handleFilterChange('mime_type', e.target.value)}
                        sx={{ mr: '10px' }}
                      />
                      <TextField
                        label="First Seen"
                        variant="outlined"
                        value={filters.submission || ''}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        sx={{ mr: '10px' }}
                      />
                      <TextField
                        label="RAW DATA"
                        variant="outlined"
                        value={filters.raw || ''}
                        onChange={(e) => handleFilterChange('raw', e.target.value)}
                      />
                    </Box>
                    <DataGrid
                      sx={{ fontSize: '14px' }}
                      rows={results}
                      columns={columns}
                      getRowId={(row) => row.id}
                      onRowClick={(params) => handleClickOpen(params.row)}
                      disableColumnMenu={false}
                      loading={loading}
                      components={{ Toolbar: GridToolbar }}
                    />
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
                      <DialogTitle>{selectedRow && `Raw Data for ID: ${selectedRow.id}`}</DialogTitle>
                      <DialogContent dividers>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Display options">
                              <Tab label="Raw Data" {...a11yProps(0)} />
                              {rawData.startsWith('data:image') && <Tab label="Image" {...a11yProps(1)} />}
                              <Tab label="Overview" {...a11yProps(2)} />
                            </Tabs>
                          </Box>
                          <TabPanel value={tabValue} index={0}>
                            <Typography variant="body1" color="textPrimary" component="div" style={{ fontSize: '18px', whiteSpace: 'pre-wrap' }}>
                              {rawData}
                            </Typography>
                          </TabPanel>

                          {rawData.startsWith('data:image') && (
                            <TabPanel value={tabValue} index={1}>
                              <img
                                src={rawData}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                              />
                            </TabPanel>
                          )}
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary"           style={{ backgroundColor: "#ffffff", color: "#343b6f", marginLeft: "10px", fontSize: "16px" }}
>
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                </Box>
              );
            };

            export default AssetsPage;
