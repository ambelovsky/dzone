var RECORD_TYPES = ['A', 'AAAA', 'NS', 'MX', 'CNAME', 'PTR', 'TXT'];

var parseZoneFile = function(file){
	
};

var parseZone = function(stream){
	var zone = {
		records:[];
	};

	data.split('\n').forEach(function(line) {
		if(!zone.ttl) {
			zone.ttl = parseTTL(line);
		}

		var record = parseLine(line);
		if(record) {
			zone.records.push(record);
		}
	});
    
	return zone;
};

var parseZoneFileSync = function(file) {
    var fs = require('fs');
    return parseZoneSync(fs.readFileSync(file));
};

var parseZoneSync = function(data) {
	var zone = {
		records:[]
	};

	data.split('\n').forEach(function(line) {
		if(!zone.ttl) {
			zone.ttl = parseTTL(line);
		}

		var record = parseLine(line);
		if(record) {
			zone.records.push(record);
		}
	});
    
	return zone;
};

var parseTTL = function(line){
	if (line.match(/^\$TTL?\s+(.*)$/i)) {
         return parseInt( line.match(/^\$TTL?\s+(.*)$/i)[1] );
    }
};

var parseLine = function(line){
	var chunks = line.split(' ');
	var name =  chunks[0];

	if(!name) return null;

	var type = null;

	var re = /.(IN CNAME|IN A|IN AAAA|IN NS|IN AAAA|IN TXT|IN MX|IN PTR)./i;
	var typeinfo = line.match(re);


	// unsupported type
	if(!typeinfo) return null;
	var type = typeinfo[1].split(' ')[1];
	var index = line.indexOf("IN "+type)+('IN '+type).length;

	var ttl = null;
	for(var c in chunks) {
		if(c>0){
			var reg = /^\d+$/;
			var chunk = chunks[c];
			if(chunk != '' && reg.test(chunk) && line.indexOf(chunk) < line.indexOf("IN " + type)) {
				ttl = parseInt(chunk);
			}
		}
	}

	var data = line.substr(index);

	var priority = null;
    if(type=='MX') {
        var datachunks = data.split(' ');
        data ='';
        datachunks.forEach(function(chunk) {
            if(chunk && parseInt(chunk)>0 && !priority) {
                priority = parseInt(chunk);
            } else {
                if(chunk!=''){
                    data += chunk;
                }
            }
        });
    } else {
        data = data.replace(/\s+/g, '');
    }

	return {
		name:name,
		type:type,
		value:data,
		ttl:ttl,
		priority:priority
	};
};

// Module public accessor data
module.exports = {
	parseZone:parseZone,
	parseZoneFileSync:parseZoneFileSync,
	parseZoneSync:parseZoneSync,
	parseLine:parseLine,
	parseTTL:parseTTL
};
