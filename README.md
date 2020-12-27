# hejhog

A simple browser intercepting proxy cli tool. Configure the verbosity and output of the proxy using command line flags. Connect your browser to the proxy, generate and add a certificate to add to the browser. This allows the script to intercept https traffic.
I wanted a command line tool to display certain information that was easy to install on different operating systems. This tool has been tested on linux and windows.

## usage

You must set up a self signed cryptographic key and certificate to intercept https traffic.
This tool has only been tested in https intercepting mode.

Place self signed certificate and keys in the working directory to automatically use them, or alternatively
 provide the ```key``` and ```cert``` parameters directly.

```
hejhog --help
hejhog --key ./key.pem --cert ./crt.pem -v
hejhog --request-headers
hejhog --response-headers --hide-urls
hejhog -v # vervose mode
hejhog --verbose
hejhog --json
hejhog -v > ./log.txt # save a session
```

Will create a proxy server running at `localhost:8080` showing only json requests and responses

```
# Just form parameters
hejhog --params --hide-urls
```

## intercepting https

## Create a self signed certificate with OpenSSL

For windows users... get OpenSSL windows binaries or compile from source... then add the openssl bin folder to your system environment variable path. You need ```openssl``` available from the command prompt.

```
# Create the key
openssl genrsa -out ./key.pem 2048
# Create the cert
openssl req -x509 -new -nodes -key ./key.pem -days 1024 -out crt.pem -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"
```

## add the certificate to the browser
```
Go to browser preferences / privacy / certificates... add your self signed certificate to the "authorities" tab and select the checkboxes.
```
## configure the browser to hejhog as a proxy server
```
Go to browser preferences / networks / proxy settings: configure http & https proxy to the port
```

## install

```
npm i hejhog -g
```
