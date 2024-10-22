import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Tooltip, CircularProgress, IconButton  } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../../components/Header';
import axios from 'axios';
import ReportDialog from '../../../components/scanDialog.js';
import { useAuth } from '../../../AuthContext';
import { debounce } from 'lodash';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const WebamonXtend = () => {
  const [openDialog, setOpenDialog] = useState(false);
    const [screenshotData, setScreenshotData] = useState(false);
  const [rawData, setRawData] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
    const [statusColor, setStatusColor] = useState(''); // State for status color

    const { apiKey } = useAuth();
  const [filters, setFilters] = useState({ });



     const buildQueryParams = () => {
       const params = new URLSearchParams();

       for (const [key, value] of Object.entries(filters)) {
         if (value.trim() !== '') {
           params.append(key, value);
         }
       }


       return params.toString();
     };

    const fetchAssets = async () => {
      setLoading(true);
setStatusColor('yellow');
      try {


        const queryParams = buildQueryParams();
        const response = await axiosInstance(`/report?feed=webamon_x&${queryParams}`, {
          headers: {
            'x-api-key': apiKey,
          },
        });

      if (response.status === 200) {
        setStatusColor('green');
      }

        const mappedResults = response.data.reports.map((hit) => ({
          report_id: hit.meta.report_id,
          tag: hit.tag,
          submission_utc: hit.meta.submission_utc,
          submission_url: hit.meta.submission_url,
          script_count: hit.meta.script_count,
          request_count: hit.meta.request_count,
          domain_count: hit.meta.domain_count,
        }));

        setResults(mappedResults);
        setLoading(false)
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
  setLoading(true)
    const debouncedPostFilters = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedPostFilters();

    // Clean up the debounce on unmount
    return () => {
      debouncedPostFilters.cancel();
    };
  }, [filters]);

  const handleClearFilters = () => {
  setStatusColor('yellow');
    setFilters({});
  };

  const handleFilterChange = (key, value) => {
  setStatusColor('yellow');
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleClickOpen = async (rowData) => {
  setLoading(true)
setStatusColor('yellow');
    try {
            const response = await axiosInstance(`/report/${rowData.report_id}`, {
    headers: {
          'x-api-key': apiKey,
        },
        });

      setRawData(response.data.report);
            const screenshotResponse = await axiosInstance.get(`/screenshot/${rowData.report_id}`, {
              headers: {
                      'x-api-key': apiKey        },
            });

            if (screenshotResponse.data.screenshot) {
              setScreenshotData(screenshotResponse.data.screenshot.screenshot);
            } else {
              setScreenshotData(false);
            }
      setOpenDialog(true);
      setLoading(false)
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
           console.log('Error fetching data');
         }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData('');
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
    { field: 'submission_utc', headerName: 'Scan Time', flex: 0.3, filterable: true },
    { field: 'submission_url', headerName: 'Submission', flex: 0.7, filterable: true },
    { field: 'domain_count', headerName: 'Domains', flex: 0.2, filterable: true },
    { field: 'request_count', headerName: 'Requests', flex: 0.2, filterable: true },
    { field: 'script_count', headerName: 'Scripts', flex: 0.2, filterable: true },
    { field: 'tag', headerName: 'Tag', flex: 0.3, filterable: true },
  ];

  const statusText = {
    green: 'Success',
    blue: 'No Results',
    red: '5xx Server Error',
    yellow: 'Loading...',
    '': 'Idle',
  };

  return (
    <Box m="20px" sx={{backgroundColor: '#171b2d'}}>
      <Header title="Webamon Xtend" subtitle="Webamon Enriched Public Feeds" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '20px' }}>
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
                     {loading && <CircularProgress size={20} sx={{ color: '#ffffff' }} />}
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
                     label="DATE"
                     variant="outlined"
                     value={filters.submission_utc || ''}
                     onChange={(e) => handleFilterChange('submission_utc', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                   <TextField
                     label="URL"
                     variant="outlined"
                     value={filters['request.response.url'] || ''}
                     onChange={(e) => handleFilterChange('request.response.url', e.target.value)}
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
                     label="Report ID"
                     variant="outlined"
                     value={filters.report_id || ''}
                     onChange={(e) => handleFilterChange('report_id', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                   <TextField
                     label="Page DOM"
                     variant="outlined"
                     value={filters.dom || ''}
                     onChange={(e) => handleFilterChange('dom', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                    <TextField
                       label="Page Title"
                       variant="outlined"
                       value={filters.page_title || ''}
                       onChange={(e) => handleFilterChange('page_title', e.target.value)}
                       sx={{ mr: '10px' }}
                     />
                   <TextField
                     label="SHA256"
                     variant="outlined"
                     value={filters['resource.sha256'] || ''}
                     onChange={(e) => handleFilterChange('resource.sha256', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                   <TextField
                     label="IP"
                     variant="outlined"
                     value={filters['server.ip'] || ''}
                     onChange={(e) => handleFilterChange('server.ip', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                     <TextField
                       label="ASN NAME"
                       variant="outlined"
                       value={filters['server.asn.name'] || ''}
                       onChange={(e) => handleFilterChange('server.asn.name', e.target.value)}
                       sx={{ mr: '10px' }}
                     />
                   <TextField
                     label="COUNTRY"
                     variant="outlined"
                     value={filters['server.country.name'] || ''}
                     onChange={(e) => handleFilterChange('server.country.name', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                   <TextField
                     label="DOMAIN"
                     variant="outlined"
                     value={filters['domain.name'] || ''}
                     onChange={(e) => handleFilterChange('domain.name', e.target.value)}
                     sx={{ mr: '10px' }}
                   />
                     <TextField
                       label="SERVER"
                       variant="outlined"
                       value={filters['server.server'] || ''}
                       onChange={(e) => handleFilterChange('server.server', e.target.value)}
                       sx={{ mr: '10px' }}
                     />
                   <TextField
                   label="TECHNOLOGY"
                   variant="outlined"
                   value={filters['technology.name'] || ''}
                   onChange={(e) => handleFilterChange('technology.name', e.target.value)}
                   sx={{ mr: '10px' }}
                 />
        </Box>
        <DataGrid
          sx={{ fontSize: '20px' }}
          rows={results}
          columns={columns}
          getRowId={(row) => row.report_id}
          onRowClick={(params) => handleClickOpen(params.row)}
          disableColumnMenu={false}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
        <ReportDialog
          open={openDialog}
          onClose={handleCloseDialog}
          rowData={rawData}
          screenshot={screenshotData}
        />
      </Box>
    </Box>
  );
};

export default WebamonXtend;
