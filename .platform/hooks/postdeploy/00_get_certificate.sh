#!/usr/bin/env bash
sudo certbot --nginx --non-interactive -d partitasmusic.com -d www.partitasmusic.com --keep-until-expiring --agree-tos --email pozzomarc@gmail.com
sudo certbot --nginx --non-interactive -d www.partitasmusic.com --keep-until-expiring --agree-tos --email pozzomarc@gmail.com
