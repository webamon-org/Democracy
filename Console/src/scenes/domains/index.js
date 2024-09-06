import { Box, Button, TextField,CircularProgress, Tooltip, IconButton } from "@mui/material";
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



const Domains = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusColor, setStatusColor] = useState(''); // State for status color

  const { apiKey } = useAuth();

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
        const response = await axiosInstance.get(`/domain?${queryParams}`, {
     headers: {
          'x-api-key': apiKey,
        },
        });

        if (response.status === 200) {
                setStatusColor('green');
              }

      const mappedResults = response.data.domain.map(hit => ({
        id: hit.id,
        country_name: hit.country.name,
        asn_org: hit.asn.name,
        ...hit,
      }));

      setResults(mappedResults);
      setLoading(false);
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
    { field: "last_update", headerName: "Updated", flex: 0.2, filterable: true },
    { field: "sub_domain", headerName: "Sub Domain", flex: 0.2, filterable: true },
    { field: "name", headerName: "Domain", flex: 0.4, filterable: true },
    { field: "server", headerName: "Server", flex: 0.3, filterable: true },
    { field: "hosting_scripts", headerName: "Scripts", flex: 0.1, filterable: true },
    { field: "country_name", headerName: "Hosting Country", flex: 0.2, filterable: true },
    { field: "asn_org", headerName: "ASN", flex: 0.3, filterable: true },
    { field: "ip", headerName: "Hosting IP", flex: 0.2, filterable: true },
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
      <Header title="DOMAINS" subtitle="Collection of all discovered domains" />
      <Box m="40px 0 0 0" height="75vh">
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
            label="DOMAIN"
            variant="outlined"
            value={filters.name || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
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
            label="SUB DOMAIN"
            variant="outlined"
            value={filters.sub_domain || ''}
            onChange={(e) => handleFilterChange('sub_domain', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="A Record"
            variant="outlined"
            value={filters['dns.a'] || ''}
            onChange={(e) => handleFilterChange('dns.a', e.target.value)}
            sx={{ mr: '10px' }}
          />
        <TextField
          label="MX Record"
          variant="outlined"
          value={filters['dns.mx'] || ''}
          onChange={(e) => handleFilterChange('dns.mx', e.target.value)}
          sx={{ mr: '10px' }}
        />
              <TextField
                label="NS Record"
                variant="outlined"
                value={filters['dns.ns'] || ''}
                onChange={(e) => handleFilterChange('dns.ns', e.target.value)}
                sx={{ mr: '10px' }}
              />
                <TextField
                  label="TXT Record"
                  variant="outlined"
                  value={filters['dns.txt'] || ''}
                  onChange={(e) => handleFilterChange('dns.txt', e.target.value)}
                  sx={{ mr: '10px' }}
                />
            <TextField
              label="COUNTRY"
              variant="outlined"
              value={filters['country.name'] || ''}
              onChange={(e) => handleFilterChange('country.name', e.target.value)}
              sx={{ mr: '10px' }}
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

export default Domains;
