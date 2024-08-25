import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css'; // Import Swagger UI's default CSS
import './swagger-custom.css'; // Import your custom CSS

const SwaggerDocs = () => {
  return (
    <div className="swagger-container">
      <SwaggerUI url="https://community.webamon.co.uk/openapi" />
    </div>
  );
};

export default SwaggerDocs;
