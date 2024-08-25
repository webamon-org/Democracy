import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../components/Header';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import debounce from 'lodash.debounce';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
});



const AssetsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
    const [tabValue, setTabValue] = useState(0); // State for managing active tab
  const [filters, setFilters] = useState({ });
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
    setError(null);

    try {
        const queryParams = buildQueryParams();
        const response = await axiosInstance.get(`/resource?${queryParams}`, {
         headers: {
                  'x-api-key': apiKey,
                },
        });

      const mappedResults = response.data.resources.map((hit) => ({
        ...hit,
      }));

      setResults(mappedResults);
      setTotalCount(response.data.resources.total.value);
    } catch (err) {
              if (err.response && err.response.status === 400) {
                // If a 400 error is returned, clear the results
                setNoResults('true')
                setResults([]);
              } else {
                setError('Error fetching data');
              }
            } finally {
              setLoading(false);
            }
  };

  useEffect(() => {
  setLoading(true)
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
    setFilters({
      ...filters,
      [key]: value,
    });
  };


  const buildQuery = (filters) => {
    const query = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value.trim() !== '') {
        query.push({
          query_string: {
            query: `${key}:${value}`,
          },
        });
      }
    }

    return query;
  };


    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

  const handleClickOpen = async (rowData) => {
    setSelectedRow(rowData);

    try {

      const response = await axiosInstance(`https://community.webamon.co.uk/resource/${rowData.id}`, {
         headers: {
                  'x-api-key': apiKey,
                },
      });
      const { resource, type } = response.data.resource; // Extract rawData and mime from response
      if (['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(type)) {
        if (type === 'image/gif') {
          setRawData(resource);
        } else {
          setRawData(`data:${type};base64,${resource}`);
        }
      } else {
        // For non-image types, set rawData as is
        setRawData(resource);
      }

      setOpenDialog(true); // Open the dialog
    } catch (err) {
      console.error('Error fetching rawData:', err);
      setError('Error fetching rawData');
    }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData(''); // Clear rawData when closing the dialog
  };

  const columns = [
    { field: 'type', headerName: 'Type', flex: 0.5, filterable: true },
    { field: 'sha256', headerName: 'SHA256', flex: 1, filterable: true },
        { field: 'SUBMISSION', headerName: 'Submission', flex: 1, filterable: true },
    { field: 'tag', headerName: 'Tag', flex: 1, filterable: true },
    { field: 'hits', headerName: 'Hits', flex: 1, filterable: true },
    { field: 'malicious', headerName: 'Malicious', flex: 1, filterable: true },

  ];
  const getStatusColor = () => {
    if (loading) return 'yellow';
    if (error) return 'red';
    if (noResults) return 'blue';
    if (results.length > 0) return 'green';
    return 'transparent';
  };


  const getStatusMessage = () => {
    if (loading) return 'Loading data...';
    if (error) return 'Error fetching data';
    if (noResults) return 'No results';
    if (results.length > 0) return 'Data loaded successfully';
    return 'Idle';
  };

  return (
    <Box m="20px">
        <Tooltip title={getStatusMessage()} arrow>
            <Box sx={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              position: 'absolute',
              top: '20px',
              right: '20px',
              cursor: 'pointer', // Changes cursor to pointer on hover
            }} />
          </Tooltip>
      <Header title="RESOURCES" subtitle="Web Assets Discovered During Scans" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={fetchAssets}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="SHA256"
            variant="outlined"
            value={filters.sha256}
            onChange={(e) => handleFilterChange('sha256', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="TAG"
            variant="outlined"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            sx={{ mr: '10px' }}
          />
                    <TextField
                      label="COUNTRY"
                      variant="outlined"
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      sx={{ mr: '10px' }}
                    />
                              <TextField
                                label="SERVING IP"
                                variant="outlined"
                                value={filters.serving_ip}
                                onChange={(e) => handleFilterChange('serving_ip', e.target.value)}
                                sx={{ mr: '10px' }}
                              />
                              <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
                                <InputLabel>WHITELISTED</InputLabel>
                                <Select
                                  label="whitelisted"
                                  value={filters.scanned}
                                  onChange={(e) => handleFilterChange('white_listed', e.target.value)}
                                >
                                  <MenuItem value="">All</MenuItem>
                                  <MenuItem value="true">True</MenuItem>
                                  <MenuItem value="false">False</MenuItem>
                                </Select>
                              </FormControl>
                    <TextField
                      label="NOTES"
                      variant="outlined"
                      value={filters.notes}
                      onChange={(e) => handleFilterChange('notes', e.target.value)}
                      sx={{ mr: '10px' }}
                    />
<TextField
            label="Type (MIME)"
            variant="outlined"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="SUBMISSION"
            variant="outlined"
            value={filters.submission}
            onChange={(e) => handleFilterChange('submission', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="RAW DATA"
            variant="outlined"
            value={filters.raw}
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
           <Button onClick={handleCloseDialog} color="primary">
             Close
           </Button>
         </DialogActions>
       </Dialog>


      </Box>
    </Box>
  );
};

export default AssetsPage;
