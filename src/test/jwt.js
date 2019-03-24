/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

test('jwt', function (t) {
    t.plan(2);
	var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZHZhbmNlZE1vZGUiOmZhbHNlLCJlbWFpbCI6IiIsImZheCI6IiIsImZpcnN0bmFtZSI6IiIsImlzQWRtaW4iOnRydWUsImlzT3JnQWRtaW4iOmZhbHNlLCJsYXN0bmFtZSI6IiIsIm1ldHJpYyI6ZmFsc2UsIm1vYmlsZXBob25lIjoiIiwib3JnaWQiOiJkZWZhdWx0IiwidGltZXpvbmUiOiIiLCJ0eXBlIjoiIiwidXNlcm5hbWUiOiJhZG1pbiIsIndvcmtwaG9uZSI6IiIsImlhdCI6MTU1MzM5NzQ3Mn0.YXHbspl_xbWmoY_ATG0l2ijOMVRAfFw6PsprsAXFuCw";

	jwt.verify(token, 'seecret');
	const decoded = jwt.decode(token);
	t.equal(decoded.username, 'admin')
	t.equal(decoded.iat, 1553397472);
});
