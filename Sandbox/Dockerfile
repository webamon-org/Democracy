# Use python:3.11 base image for building the project
FROM python:3.11 as build

# Install Chrome and Chromedriver
RUN curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.86/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.86/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/

# Use python:3.11 for the final image
FROM python:3.11

# Set the working directory
WORKDIR /app

# Install necessary dependencies, iproute2, and iptables
RUN apt-get update && \
    apt-get install -y wget unzip curl gnupg2 lsb-release ca-certificates openvpn iproute2 iputils-ping iptables fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 xdg-utils libu2f-udev

# Copy Chrome and Chromedriver from the build stage
COPY --from=build /opt/chrome-linux64 /app/chrome
COPY --from=build /opt/chromedriver-linux64 /app/

# Copy application files
COPY main.py /app/webamon-sandbox.py
COPY opensearch.py /app/opensearch.py
COPY community.py /app/community.py
COPY technology_patterns.txt /app/technology_patterns.txt
COPY report.py /app/report.py
COPY threatai.py /app/threatai.py
COPY requirements.txt /app/requirements.txt
COPY geoIP /app/geoIP

# Set environment variables
ENV PATH="/app:$PATH"
ENV source=""
ENV scan_type=""
ENV scan_timeout=30
ENV threads=1
ENV user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3"
ENV url=""
ENV tag="community"
ENV set_cookies='{}'
ENV log_level="INFO"
ENV compare_previous="False"
ENV skip_if_exists="False"
ENV queue_worker="True"
ENV community="False"
ENV hash_types='["sha256"]'
ENV webamon_apikey = ''

# Resource Saving Configuration
ENV save_elastic="True"
ENV save_images="False"
ENV save_css="False"
ENV save_dom="True"
ENV save_screenshot="True"
ENV save_resources="True"

# AWS Configuration
ENV aws_save="False"
ENV aws_key=""
ENV aws_resource_bucket=""
ENV aws_dom_bucket=""
ENV aws_screenshot_bucket=""

# ElasticSearch Configuration
ENV elastic_base="https://localhost:9200"
ENV elastic_creds='["admin","password!"]'
ENV elastic_query=""
ENV elastic_query_index=""
ENV elastic_size=100

# Monitoring and Analysis
ENV threat_ai="False"
ENV threat_ai_endpoint=""
ENV webamon_monitor=""
ENV monitor_profile=""
ENV webamon_proxy=""

# DNS and WHOIS
ENV whois="False"
ENV dns="True"
ENV rDNS="False"
ENV check_dangling="False"
ENV check_ports=""
ENV port_check_config="NONE"

# Install Python requirements
RUN pip install --no-cache-dir -r requirements.txt


# Use entrypoint script to connect to NordVPN with OpenVPN
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose the necessary port for Flask
EXPOSE 5000

# Use entrypoint to start OpenVPN and your application
ENTRYPOINT ["/app/entrypoint.sh"]
