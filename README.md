# `hejhog`

I wanted a simple unixy browser fowarding proxy cli tool that behaved like tshark where you can configure the verbosity and output of the proxy using command line flags.
I wanted a command line tool to display certain information that was easy to install on different operating systems. This tool has been tested on linux and windows.

## `usage`

* Create some self signed certificates* in the current working directory,
* install hejhog globally (npm i hejhog -g) and run the `hejhog` command.
* Configure your browser to use `localhost:8080` as the http and https proxy.
* Add a self signed certificate authority to the browser.

```
> hejhog --help
> hejhog --just-urls

```

You will then see the throughput when connecting to `duckduckgo.com` in the browser...

```

<hejhog> listening @ 8080
 <request>  https: // duckduckgo.com /
 <request>  https: // duckduckgo.com /font/ProximaNova-Reg-webfont.woff2
 <request>  https: // incoming.telemetry.mozilla.org /submit/activity-stream/sessions/1/0da2c611-8fef-4041-8215-dc167fbf2922
 <request>  https: // improving.duckduckgo.com /t/hi?2512489&b=firefox&atbi=false&ei=true&i=false&d=d&l=en_US&p=windows&atb=v253-5&va=_&atbva=_&g=__
 <request>  https: // duckduckgo.com /ac/?q=k&kl=wt-wt

```

## `intercepting https` *

You must set up a self signed cryptographic key and certificate to intercept https traffic.
This tool has only been tested in https intercepting mode.

Place self signed certificate and keys in the working directory to automatically use them, or alternatively
 provide the ```key``` and ```cert``` parameters directly.

## `create a self signed certificate with OpenSSL`

```
# create the key
openssl genrsa -out ./key.pem 2048
# create the cert
openssl req -x509 -new -nodes -key ./key.pem -days 1024 -out crt.pem -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"
```

## `add the certificate to the browser`
```
Go to browser preferences / privacy / certificates... add your self signed certificate to the "authorities" tab and select the checkboxes.
```
## `configure the browser using hejhog as a proxy server`
```
Go to browser preferences / networks / proxy settings: configure http & https proxy to the port
```

## `saving a session`

Hejhog works as a ut8 encoded text stream so you can easily store the output of hejhog to a text file for later analysis.

```
hejhog -v > ./log.txt
```

## `issues`

Please report any issues.

## `install`

```
npm i hejhog -g
```
