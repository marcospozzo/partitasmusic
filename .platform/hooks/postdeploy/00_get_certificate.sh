#!/usr/bin/env bash
sudo certbot --nginx --non-interactive -d partitasmusic.com -d *.partitasmusic.com -d partitasmusic.us-east-1.elasticbeanstalk.com --keep-until-expiring --agree-tos --email pozzomarc@gmail.com