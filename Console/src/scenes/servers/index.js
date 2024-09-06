import { Box, Button, TextField, Tooltip, IconButton, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import debounce from 'lodash.debounce';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  headers: {
    'Content-Type': 'application/json',
  },
});

const ServerPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { apiKey } = useAuth();
  const [statusColor, setStatusColor] = useState(''); // State for status color
  const [filters, setFilters] = useState({});


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

        const response = await axiosInstance.get(`/server?${queryParams}`, {
headers: {
                'x-api-key': apiKey        },
        });

      if (response.status === 200) {
        setStatusColor('green');
      }

      const mappedResults = response.data.server.map(hit => ({
        id: hit.id,
        country_name: hit.country.name,
        asn_org: hit.asn.name,
        asn_num: hit.asn.number,
        ...hit,
      }));

      setResults(mappedResults);
      setLoading(false);
    }catch (err) {
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
    const debouncedFetchAssets = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedFetchAssets();

    // Clean up the debounce on unmount
    return () => {
      debouncedFetchAssets.cancel();
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
    { field: "last_update", headerName: "Last Seen", flex: 0.2, filterable: true },
    { field: "server", headerName: "Server", flex: 0.3, filterable: true },
    { field: "ip", headerName: "IP", flex: 0.3, filterable: true },
    { field: "asn_num", headerName: "ASN", flex: 0.2, filterable: true },
    { field: "asn_org", headerName: "ASN ORG", flex: 0.3, filterable: true },
    { field: "resource_count", headerName: "Resources", flex: 0.2, filterable: true },
    { field: "country_name", headerName: "Country", flex: 0.2, filterable: true },
    { field: "domain", headerName: "Domain", flex: 0.4, filterable: true },
  ];

  const statusText = {
    green: 'Success',
    blue: 'No Results',
    red: '5xx Server Error',
    yellow: 'Loading...',
    '': 'Idle',
  };


  return (
    <Box m="20px" sx={{backgroundColor: '#191b2d'}}>
      <Header title="SERVERS" subtitle="Collection of all discovered servers" />
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
          {/* Box containing the buttons */}
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
            label="SERVER NAME"
            variant="outlined"
            value={filters.server || ''}
            onChange={(e) => handleFilterChange('server', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="IP"
            variant="outlined"
            value={filters.ip || ''}
            onChange={(e) => handleFilterChange('ip', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="ASN NAME"
            variant="outlined"
            value={filters['asn.name'] || ''}
            onChange={(e) => handleFilterChange('asn.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="COUNTRY"
            variant="outlined"
            value={filters['country.name'] || ''}
            onChange={(e) => handleFilterChange('country.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters.domain || ''}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
          />
        </Box>
        <DataGrid
          sx={{ fontSize: '20px' }}
          rows={results}
          columns={columns}
          getRowId={(row) => row.id}
          disableColumnMenu={false}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default ServerPage;
