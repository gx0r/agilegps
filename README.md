[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WTGZ7P8E8D9JE)

# AgileGPS: Open Source Fleet Tracking

![screenshot](https://raw.githubusercontent.com/llambda/agilegps/master/public/images/screen1.png?token=AGc1MoMRLFILb287jsksqBY-hvOtCRakks5Ym6-uwA%3D%3D)


## Features

1. Compatible with [Queclink GV500](https://www.amazon.com/Professional-Quality-GV500-Vehicle-Tracker/dp/B00XLSDNDO/ref=as_sl_pc_qf_sp_asin_til?tag=agilegps-20&linkCode=w00&linkId=2a0bd062af220b70c28683c305f01385&creativeASIN=B00XLSDNDO) and GV300 trackers.
1. UDP data transmission from trackers with server acknowledgement (lower cellular data usage than TCP)
1. Customers, fleets, devices, and users
1. Site admins and org admins
1. Multi tenant. Multiple organizations (customers) per instance
1. Displays vehicles and fleets on Google Maps in real time
1. Display per-vehicle daily history on Google Maps
1. Node.js back end for high performance and concurrency
1. Stateless architecture, load balance across unlimited app nodes
1. Stateless authentication via JWT
1. RethinkDB enables atomic, realtime changefeeds. Clients efficiently receive changes in real-time, as they happen. Easy scaling, sharding and replication.
1. Fleet and vehicle reports: Start/stop, Ignition-based trips, Idling, Mileage by state, Odometer by state, Speed, Vehicle summary, OBD-II diagnostics (GV 500 only), OBD-II engine summaries (GV 500 only)
1. Localization: English and Russian language translations. English and metric units (per-user preference)
1. Free reverse geocoding (closest city) or via Google Reverse Geocoding API for obtaining addresses from latitude / longitude coordinates sent by the trackers.
1. Fast single page web interface via Mithril (component based like React). Responsive design on desktop and mobile browsers.

## Need help?

Need help with setup, install, feature development, or just want to talk about GPS fleet tracking in general? Contact [Gene Michtchenko](mailto:agilegps@gmail.com) for consulting at reasonable rates!

## Installation Guide

[Click here for installation instructions!](INSTALL.md)
