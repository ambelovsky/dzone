var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter();

var RECORD_TYPES = ['A', 'AAAA', 'NS', 'MX', 'CNAME', 'PTR', 'TXT'];

/**
* Parses a zonefile.
* @param file String
* @param recordProcessedCallback function() (optional)
*
* Events
* - 'recordProcessed' (err, record) called anytime a record line is processed from the zonefile
**/
module.exports.parseZoneFile = function(file, recordProcessedCallback){
    var fs = require('fs');
	var fileIn = fs.createReadStream(file);
    if(recordProcessedCallback)
        return module.exports.parseZone(fileIn, recordProcessedCallback);
    return module.exports.parseZone(fileIn);
};

/**
* Parses a zonefile input stream.
* @param stream Stream
* @param recordProcessedCallback function() (optional)
*
* Events
* - 'recordProcessed' (err, record) called anytime a record line is processed from zonefile input stream
**/
module.exports.parseZone = function(stream, recordProcessedCallback){
	var zone = {
		records:[]
	};
    
    // use callback function if specified
    if(recordProcessedCallback) {
        module.exports.on('recordProcessed', function(err, record) {
            recordProcessedCallback(err, record);
        });
    }

	stream.on('readable', function() {
        var chunk = null;
        
        while(null !== (chunk = stream.read())) {
            var chunkStr = chunk.toString();
            var currLine = zone.records.length == 0 ? 0 : linex.length - 1;
            
            // detect newline characters and split array elements thusly
            if(chunkStr.indexOf("\n") > -1) {
                var breakParts = chunkStr.split('\n');
              
                for(var i = 0; i < breakParts.length; i++) {
                    var ishift = currLine + i;
              
                    if(zone.records.length <= ishift) zone.records[ishift] = "";
                    zone.records[ishift] += breakParts[i];
                }
            } else zone.records[currLine] += chunkStr;
            
            // shift records off the array as we enter them into the database
            // leave the last line alone in case it is still forming
            while(zone.records.length > 1) parseLineAsync(zone.records.shift());
        }
        
        // take care of the last line when we know it's done forming
        while(zone.records.length > 0) parseLineAsync(zone.records.shift());
    });
};

/**
* Asynchronous event-driven line parsing wrapper
* @param line String
*
* Events
* - 'recordProcessed' (err, record)
**/
function parseLineAsync(line) {
    var record = module.exports.parseLine(line);
    var err = null;
    
    if(!record) {
        err = "Error processing line.";
    }
    
    module.exports.emit('recordProcessed', err, record);
};

/**
* Synchronously parses a zonefile.
* @param file String
* @return zonefile object
**/
module.exports.parseZoneFileSync = function(file) {
    var fs = require('fs');
    return module.exports.parseZoneSync(fs.readFileSync(file));
};

/**
* Synchronously parses zonefile data.
* @param data String
* @return zonefile object
**/
module.exports.parseZoneSync = function(data) {
	var zone = {
		records:[]
	};

	data.split('\n').forEach(function(line) {
		if(!zone.ttl) {
			zone.ttl = parseTTL(line);
		}

		var record = module.exports.parseLine(line);
		if(record) {
			zone.records.push(record);
		}
	});
    
	return zone;
};

/**
* Parses TTL data from a single line of the zonefile.
* @param line String
* @return TTL Int
**/
function parseTTL(line){
	if (line.match(/^\$TTL?\s+(.*)$/i)) {
         return parseInt( line.match(/^\$TTL?\s+(.*)$/i)[1] );
    }
};

/**
* Parses data from a single line of the zonefile.
* @param line String
* @return zonefile line object
*   {
*		name:name,
*		type:type,
*		value:data,
*		ttl:ttl,
*		priority:priority
*	}
**/
module.exports.parseLine = function(line){
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
