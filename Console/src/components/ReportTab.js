import React, { useState, useEffect } from "react";
import axios from 'axios';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Tab, Tabs,  Table,
                                  TableBody,
                                  TableCell,
                                  TableContainer,
                                  TableHead,
                                  Typography,
                                  Paper,
                                  Button,
                                  TableRow,IconButton } from '@mui/material';
import GraphComponent from './map';
import DiffViewer from "react-diff-viewer";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Modal from '@mui/material/Modal';
import ChatBot from './threatai';
import { useAuth } from '../AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});







function MaterialTabs({ reportData, screenshot }) {
    const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showRawTable, setShowRawTable] = useState(false);
const { apiKey } = useAuth();
  const handleButtonClick = () => {
    setShowRawTable(true);
  };



const ExpandedRow = ({ request,report }) => {

const resource = report.resource.find(resource => resource.url === request.request.url);
const sha256 = resource ? resource.sha256 : null;

  const handleVirusTotalClick = (sha1In) => {
    // Open a new tab with the VirusTotal URL and the sha1 value
    window.open(`https://www.virustotal.com/gui/search/${sha1In}`);
    handleClose();
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
    const handleClose = () => {
      setAnchorEl(null);
    };
  return (
  <>
<TableRow>
  <TableCell colSpan={10}>
    <Box display="flex">
      <Box flex="1">
        <Typography variant="h6" gutterBottom>
          {request.request.method} Request Headers
        </Typography>
        <HeaderTable data={request.request} />
      </Box>
      <Box flex="1">
        <Typography variant="h6" gutterBottom>
          Response Headers
        </Typography>
        <HeaderTable data={request.response} />
      </Box>

    </Box>
  </TableCell>
</TableRow>

<TableRow>
  <TableCell colSpan={10}>
    <Box display="flex">
    <Box flex="1">
      <Typography variant="h6" gutterBottom>
        Response Data
      </Typography>
    <>
            <Typography variant="subtitle1" gutterBottom>
              {request.response.url}
            </Typography>
      <Typography variant="subtitle1" gutterBottom onClick={handleClick} style={{ cursor: 'pointer', color: 'blue' }}>
        SHA256: {sha256}
      </Typography>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
  <MenuItem onClick={() => handleVirusTotalClick(sha256)}>Lookup on VirusTotal</MenuItem>
        </Menu>
    </>

    <Typography variant="subtitle1" gutterBottom>
      TYPE:{request.response.mime_type}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      FIRST SEEN: 23rd February 2023
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      SIZE:{request.response.encoded_data_length}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      AVAILABLE: True
    </Typography>
      <Button onClick={handleButtonClick} variant="outlined" color="primary" style={{ color: 'white', fontWeight: 'bold', border: '2px solid white', borderRadius: '5px' }}>
        Show Raw
      </Button>
    <Button onClick={handleButtonClick} variant="outlined" color="primary">
      Related Reports
    </Button>
    <Button onClick={handleButtonClick} variant="outlined" color="primary">
      Used By
    </Button>
        <Button onClick={handleButtonClick} variant="outlined" color="primary">
          SCAN
        </Button>
    <Button onClick={handleButtonClick} variant="outlined" color="primary">
      WHOIS LOOKUP
    </Button>
        <Button onClick={handleButtonClick} variant="outlined" color="primary">
          DNS LOOKUP
        </Button>
      {showRawTable &&

          <Box display="flex">
          <Box flex="1">
          <RawTable data={sha256} />
              </Box>
                </Box>}
    </Box>
      </Box>
      </TableCell>
</TableRow>
</>
  );
};



  const [expandedRow, setExpandedRow] = useState(null);

  const handleRowClick = (index) => {
    setShowRawTable(false);

    setExpandedRow(expandedRow === index ? null : index);
  };


const HeaderTable = ({ data }) => {
  return (
    <Paper elevation={3} style={{ margin: '20px', padding: '20px' }}>
      <TableContainer style={{ maxHeight: '300px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Header</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Value</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell>{header.name}</TableCell>
                <TableCell>{header.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};


const RawTable = ({ data }) => {
  const [responseData, setResponseData] = useState(null);




  useEffect(() => {
    const fetchData = async () => {


      try {

        const response = await axiosInstance.get(`/resource/${data}`, {
       headers: {
                       'x-api-key': apiKey        },
        });

        setResponseData(response.data.resource);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          // If a 400 error is returned, clear the results
          setResponseData([]);
        } else {
          console.log('Error fetching data');
        }
      }


    };


    fetchData();
  }, [data]);

  return (
    <Paper elevation={3} style={{ margin: '20px', padding: '20px' }}>
      <TableContainer style={{ maxHeight: '300px',maxWidth: '1700px' }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Add your table header cells here if needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{JSON.stringify(responseData,null,2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};





function escapeHtml(html) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

    function highlightAndEscapeCode(code) {
      return escapeHtml(code);
    }


  const [open, setOpen] = useState(false);

  const handleImageClick = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };


const PageScripts = ({ scripts }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '4px',
        overflowY: 'auto',
      }}
    >
      {scripts.map((script, index) => (
        <pre
          key={index}
          style={{ whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: highlightAndEscapeCode(script) }}
        />
      ))}
    </Box>
  );
};


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };




  return (
    <div>
       {reportData && (
                <Box sx={{   '& .MuiDialog-paper': {
                                              backgroundColor: '#171b2d',
                                              color: 'text.primary',
                                            }, color: "black", marginTop: "2rem", maxWidth : "100%" , overflowX: "auto"}}>
                <Box sx={{
                                     display: 'flex',
                                     justifyContent: 'space-evenly',

                                   }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Scrollable tabs example"

          >              <Tab label="Overview" sx={{fontSize: "20px"}}/>
                    <Tab label="DOM"  sx={{fontSize: "20px"}}/>
                    <Tab label="Requests"  sx={{fontSize: "20px"}}/>
                    <Tab label="Scripts"  sx={{fontSize: "20px"}}/>
                    <Tab label="Certificates"  sx={{fontSize: "20px"}}/>
                    <Tab label="Cookies" sx={{fontSize: "20px"}} />
                    <Tab label="TECHNOLOGY"  sx={{fontSize: "20px"}}/>
                    <Tab label="MAP" sx={{fontSize: "20px"}}/>
                    <Tab label="DOMAINS"  sx={{fontSize: "20px"}}/>
                    <Tab label="SERVERS" sx={{fontSize: "20px"}} />
                    <Tab label="Threat AI" sx={{fontSize: "20px"}} />

                  </Tabs>
                  </Box>
                  {activeTab === 0 && (
    <>
      <Box
        sx={{
          display: 'flex',
          '& > :nth-child(1), & > :nth-child(2)': {
            flex: '1 1 33.33%',
            marginTop: "30px",
            overflowY: 'auto',
            boxSizing: 'border-box',
            color: '#e0e0e0',
            borderRight: '1px solid #ccc',
          },
          '& > :nth-child(3)': {
            flex: '1 1 33.33%',
            marginTop: "30px",
            borderRight: 'none',
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            background: '#171b2d',
            '& img': {
              maxWidth: '100%',
              maxHeight: '100%',
              cursor: 'zoom-in',
            },
          },
        }}
      >
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
    <span>Domain:</span>
    <span style={{ textAlign: 'right' }}>{reportData.resolved_domain}</span>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
    <span >Submission:</span>
    <span style={{ textAlign: 'right' }}>{reportData.submission_url}</span>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
    <span s>Date/Time:</span>
    <span style={{ textAlign: 'right' }}>{reportData.submission_utc}</span>
  </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <span s>Status:</span>
        <span style={{ textAlign: 'right' }}>{reportData.scan_status}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <span s>Hosting:</span>
        <span style={{ textAlign: 'right' }}>{reportData.hosting}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <span s>Errors:</span>
        <span style={{ textAlign: 'right' }}>{reportData.errors}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <span s>Tags:</span>
        <span style={{ textAlign: 'right' }}>{reportData.tag}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <span s>Title:</span>
        <span style={{ textAlign: 'right' }}>{reportData.page_title}</span>
        </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                <span s>Previous Scans:</span>
                <span style={{ textAlign: 'right' }}>Yet Another Key</span>
                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                <span s>User Agent Used:</span>
                                <span style={{ textAlign: 'right' }}>Yet Another Key</span>
                                </div>
  {/* Add more divs as needed */}
</div>


<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>

<div style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
    <span style={{ fontWeight: 'bold', width: '50%' }}>Technology</span>
  </div>
  {reportData.technology.map((item, index) => (
    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1px' }}>
      <span>{item.name}</span>
    </div>
  ))}

</div>
<div style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>

  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
    <span style={{ fontWeight: 'bold', width: '50%' }}>Countries</span>
  </div>

{[...new Set(reportData.domain.map(item => item.country.name))].map((countryName, index) => (
  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1px' }}>
    <span>{countryName}</span>
  </div>
))}

</div>

</div>
        <ClickAwayListener onClickAway={handleCloseModal}>
          <div onClick={handleImageClick}>
            {/* Third third content */}
            {screenshot ? (
              <img src={`data:image/jpeg;base64,${screenshot}`} alt="Screenshot" />

            ) : (
              <pre style={{ whiteSpace: 'pre-wrap' }}>Screenshot not available</pre>
            )}
          </div>
        </ClickAwayListener>
      </Box>
      <Modal open={open} onClose={handleCloseModal}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <img src={`data:image/jpeg;base64,${screenshot}`} alt="Expanded Screenshot" style={{ maxWidth: '90%', maxHeight: '90%', cursor: 'zoom-out' }} />
        </Box>
      </Modal>
    </>

                  )}

                  {activeTab === 1 && (
        <Box
          sx={{
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
                textOverflow: 'ellipsis',
          }}

        >
          <DiffViewer
            oldValue=""
            newValue={reportData.dom}
            splitView={false}
            showDiffOnly={false}
          />
        </Box>

                  )}

                  {activeTab === 2 && (


      <TableContainer
        sx={{
          borderRadius: "4px",
          overflowY: "auto",
          maxWidth: "100%",          maxHeight: "80vh",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
                <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap", width: "1vw" }}>
                          {/* Expand Icon Header */}
                        </TableCell>
              <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap", width: "1vw" }}>
                METHOD
              </TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", whiteSpace: "pre-wrap" }}>
                REQUEST
              </TableCell>
              <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap", width: "1vw" }}>
                IP
              </TableCell>
              <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap"}}>
                MIME
              </TableCell>
              <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap", width: "1vw" }}>
                STATUS
              </TableCell>
              <TableCell sx={{ fontSize: "26px", fontWeight: "bold", whiteSpace: "pre-wrap", width: "1vw" }}>
                SIZE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.request.map((request, index) => (
            <>
              <TableRow key={index} onClick={() => handleRowClick(index)}>
                              <TableCell>
                                <IconButton size="small">
                                  {<ExpandMoreIcon />}
                                </IconButton>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: "pre-wrap", fontSize: "22px" }}>{request.request.method}</TableCell>

<TableCell
  sx={{
    whiteSpace: 'pre-wrap',fontSize: "18px",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200, // Adjust the value based on your requirement
  }}
>
  {request.request.url}
</TableCell>
                <TableCell sx={{ whiteSpace: "pre-wrap", fontSize: "22px" }}>
                  {request.response ? request.response.ip : "-"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "pre-wrap", fontSize: "22px" }}>
                  {request.response ? request.response.mime_type : "-"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "pre-wrap", fontSize: "22px" }}>
                  {request.response ? request.response.status : "-"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "pre-wrap", fontSize: "22px" }}>
                  {request.response ? request.response.encoded_data_length : "-"}
                </TableCell>
              </TableRow>
{expandedRow === index && (
                <ExpandedRow request={request} report={reportData}
                />
              )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

                           )}
      {activeTab === 3 && (
            <Box
          sx={{
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
                textOverflow: 'ellipsis',
          }}
            >
          <div>
            <PageScripts scripts={reportData.page_scripts} />
          </div>
            </Box>
          )}
      {activeTab === 4 && (
      <TableContainer
        sx={{
          borderRadius: "4px",
          overflowY: "auto",
          minWidth: "100%",maxHeight: "80vh"
        }}
      >
      <Table>
      <TableHead>
      <TableRow>
      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>DOMAIN</TableCell>
      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>SUBJECT</TableCell>

      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>ISSUER</TableCell>
      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>FROM (utc)</TableCell>
      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>TO (utc)</TableCell>
      <TableCell sx={{ fontSize: "26px",
                           fontWeight: "bold", }}>CIPHER</TableCell>
      <TableCell sx={{ fontSize: "26px",
                                  fontWeight: "bold", }}>KEY EXCHANGE</TableCell>
      <TableCell sx={{ fontSize: "26px",
                                                             fontWeight: "bold", }}>PROTOCOL</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {Object.keys(reportData.certificate).map((certKey) => {
      const certificates = reportData.certificate[certKey];
      return (
      <TableRow  key={certKey}>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.domain_name}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.subject_name}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.issuer}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.valid_from_utc}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.valid_to_utc}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.cipher}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.key_exchange_group}</TableCell>
      <TableCell sx={{ fontSize: "22px"}}>{certificates.protocol}</TableCell>
      </TableRow>
      );
      })}
      </TableBody>
      </Table>
      </TableContainer>
      )}
          {activeTab === 5 && (
      <TableContainer sx={{
                                                    borderRadius: "4px",
                                                    overflowY: "auto",
                          maxWidth: "100%",maxHeight: "80vh"
                                                  }}
                                                >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>DOMAIN</TableCell>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>EXPIRY</TableCell>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>HTTP ONLY</TableCell>
             <TableCell sx={{ fontSize: "26px",
                                                              fontWeight: "bold", }}>SAME SITE</TableCell>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>NAME</TableCell>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>SECURE</TableCell>
              <TableCell sx={{ fontSize: "26px",
                                                 fontWeight: "bold", }}>PATH</TableCell>
             <TableCell sx={{ fontSize: "26px",
                                                        fontWeight: "bold", }}>VALUE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.cookie.map((cookie, index) => (
              <TableRow key={index}>
                <TableCell  sx={{ fontSize: "22px"}}>
                  {cookie ? cookie.domain: "-"}
                </TableCell>
                <TableCell>{cookie.expiry}</TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {cookie ? cookie.http_only.toString() : "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {cookie ? cookie.same_site : "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {cookie ? cookie.name : "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {cookie ? cookie.secure.toString() : "-"}
                </TableCell>
              <TableCell sx={{ fontSize: "22px"}}>
                {cookie ? cookie.path : "-"}
              </TableCell>
              <TableCell sx={{ fontSize: "22px"}}>
                {cookie ? cookie.value : "-"}
              </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
                                            )}
      {activeTab === 6 && (
      <Box
        sx={{
          padding: "1rem",
          borderRadius: "4px",
          maxHeight: "50vh",
          overflowY: "auto",
          color: "#e0e0e0",
          fontSize: "20px"
        }}
      >
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {reportData.technology.map((item, index) => (
            <div key={index}>
              {Object.entries(item).map(([key, value]) => (
                key === "name" && (
                  <div key={key}>
                    <strong>{value} </strong>
                  </div>
                )
              ))}
              <br />
            </div>
          ))}
        </pre>
      </Box>


                    )}
      {activeTab === 7 && (

          <div>
            <GraphComponent data={reportData} />
          </div>

                    )}

{activeTab === 8 && (
         <TableContainer sx={{
                                                            borderRadius: "4px",
                                                            overflowY: "auto",
                                  maxWidth: "100%",maxHeight: "80vh"
                                                          }}
                                                        >
                <Table>
                  <TableHead>
                    <TableRow>
                                          <TableCell sx={{ fontSize: "26px",
                                                                             fontWeight: "bold", }}>SUB DOMAIN</TableCell>
                      <TableCell sx={{ fontSize: "26px",
                                                         fontWeight: "bold", }}>DOMAIN</TableCell>
                      <TableCell sx={{ fontSize: "26px",
                                                         fontWeight: "bold", }}>SCRIPTS</TableCell>

                      <TableCell sx={{ fontSize: "26px",
                                                         fontWeight: "bold", }}>RESPONSE CODE</TableCell>

                      <TableCell sx={{ fontSize: "26px",
                                                         fontWeight: "bold", }}>SERVER</TableCell>
                     <TableCell sx={{ fontSize: "26px",
                                                                fontWeight: "bold", }}>RESOURCES</TableCell>
                                                                                      <TableCell sx={{ fontSize: "20px",
                                                                                                                         fontWeight: "bold", }}>IP</TableCell>
                     <TableCell sx={{ fontSize: "26px",
                                                                                     fontWeight: "bold", }}>ASN</TableCell>
                     <TableCell sx={{ fontSize: "26px",
                                                                                     fontWeight: "bold", }}>ASN ORG</TableCell>
                     <TableCell sx={{ fontSize: "26px",
                                                                                     fontWeight: "bold", }}>COUNTRY</TableCell>
                    <TableCell sx={{ fontSize: "26px",
                                                                             fontWeight: "bold", }}>RESPONSE BYTES</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.domain.map((domain, index) => (
                      <TableRow key={index}>
                                              <TableCell sx={{ fontSize: "22px"}}>
                                                {domain ? domain.sub_domain : "-"}
                                              </TableCell>
                        <TableCell sx={{ fontSize: "22px"}}>
                          {domain ? domain.name: "-"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "22px"}}>{domain.hosting_scripts.toString()}</TableCell>

                        <TableCell sx={{ fontSize: "22px"}}>
                          {domain ? domain.response_code : "-"}
                        </TableCell>

                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.server : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.request_count : "-"}
                      </TableCell>
                                              <TableCell sx={{ fontSize: "22px"}}>
                                                {domain ? domain.ip : "-"}
                                              </TableCell>
                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.asn.number : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.asn.name : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.country.name : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "22px"}}>
                        {domain ? domain.total_response_size : "-"}
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
       )}
{activeTab === 9 && (
 <TableContainer sx={{
                                                    borderRadius: "4px",
                                                    overflowY: "auto",
                          maxWidth: "100%",maxHeight: "80vh"
                                                  }}
                                                >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>IP</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>NETWORK</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>ASN</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>ASN_ORG</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>COUNTRY</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>SERVER</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>MIME TYPES</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>RESPONSE BYTES</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>SCRIPTS</TableCell>
              <TableCell sx={{ fontSize: "26px",fontWeight: "bold", }}>RESOURCES</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.server.map((server, index) => (
              <TableRow key={index}>
                <TableCell sx={{ fontSize: "22px"}}>
                  {server ? server.ip: "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>{server.asn.network}</TableCell>
                <TableCell>
                  {server ? server.asn.number : "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {server ? server.asn.name : "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {server ? server.country.name : "-"}
                </TableCell>
              <TableCell sx={{ fontSize: "22px"}}>
                {server ? server.server : "-"}
              </TableCell>
              <TableCell sx={{ fontSize: "22px"}}>
                {server ? server.mime_type : "-"}
              </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {server ? server.total_response_size: "-"}
                </TableCell>
                <TableCell sx={{ fontSize: "22px"}}>{server.hosting_scripts.toString()}</TableCell>
                <TableCell sx={{ fontSize: "22px"}}>
                  {server ? server.resource.length : "-"}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
       )}
                      {activeTab === 10 && (
        <Box
          sx={{
            padding: "1rem",
            borderRadius: "4px",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >

                <ChatBot />

        </Box>
      )}
      </Box>
              )}

    </div>
  );
}

export default MaterialTabs;
