# How to configure nginx for load balancing
## Install nginx on EC2 instance
```
sudo yum update
sudo amazon-linux-extras install epel
sudo yum install nginx
```
## Find and edit config file
```
sudo find / -name nginx.conf
sudo vim <PATH_TO_CONFIG_FILE>
```
Should be located at _/etc/nginx/nginx.conf_.
## Use either example config files
Use _basic nginx.conf.example_ for the most basic load balancing.  
Use _super nginx.conf.example_ for maximum throughput.  
Edit _nginx.conf_ to look like either example (feel free to add/modify any parameters as necessary.).  
Most important part is to use the same name of the upstream in the server proxy_pass.  
Add servers as needed.  
## Start nginx
```
sudo systemctl start nginx
```
Other useful commands:
```
sudo systemctl status nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
```
## Debug errors by reading the log
```
sudo find / -name nginx
```
Look for a folder like _/var/log/nginx_, there will be an _error.log_ file within.