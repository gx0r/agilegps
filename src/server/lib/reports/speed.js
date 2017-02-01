/* Copyright (c) 2016 Grant Miner */
'use strict';
export default (history, threshold) => history.filter( item => item.s > threshold);
