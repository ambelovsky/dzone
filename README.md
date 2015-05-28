What it does
============

Provides async parsing for a DNS zonefile and returns a object with an array of records and the ttl.


To Do
=====

SOA parsing


Asynchronous Usage
==================

Gimme a minute...


Synchronous Usage
=================

	var dzone = require('dzone')
	var zonedata = '@ IN A 127.0.0.1' // can be a line or a whole zonefile
	var zone = dzone.parseZoneSync(zonedata)

	{ 
	records: 
	   [ { name: '@', type: 'NS', data: 'ns.domain.com.', priority: null },
	     { name: '@', type: 'NS', data: 'ns2.domain.com.', priority: null },
	     { name: '@', type: 'NS', data: 'ns3.domain.com.', priority: null },
	     { name: '@', type: 'A', data: '127.0.0.1', priority: null },
	     { name: 'www', type: 'A', data: '127.0.0.1', priority: null },
	     { name: 'cloud',
	       type: 'CNAME',
	       data: 'test.domain.com.',
	       priority: null },
	     { name: 'files', type: 'CNAME', data: 'www', priority: null },
	     { name: '@', type: 'MX', data: 'www', priority: 10 },
	     { name: '@', type: 'TXT', data: 'somevalue', priority: null } ],
	ttl: 86400
	}	

	// other methods

	var record = dzone.paresLine(zonedata)

    {
		name:'@',
		type:'A',
		ttl:null,
		data:'127.0.0.1',
		priority:priority // only set if its an MX record	
	}

Test
====

	npm test


