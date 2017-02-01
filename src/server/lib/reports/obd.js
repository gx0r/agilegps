/* Copyright (c) 2016 Grant Miner */
'use strict';
export default history => history.filter(item => item.cmd === 'OBD' || item.cmd === 'OSM');
