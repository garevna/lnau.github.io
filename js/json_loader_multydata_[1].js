function get_transport() {
	if (XMLHttpRequest) {
		var requestVar = new XMLHttpRequest();
	}
	else {
		var requestVar = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return requestVar;
};

lnau = {
	common_data:{},
	data:[]
};

responseHeader = {
		responseType:0,
		recordNum: undefined,
		keyFields: undefined,
		keyValues: undefined,
		fields: undefined
};
worker_counter = 0;
worker_max_counter_value = 1;
//
// Вытянуть записи по ключу
//
worker_keyField = undefined;
worker_keyValue = undefined;


// --------------------------------------------------------------------------------------------
//  request_type: 
//     0 - open JSON file to read
//     1 - get the file content
//     2 - update existing JSON record by record num
//     3 - update existing JSON (all records)
//     4 - append new JSON record to the end of array
//     5 - delete JSON record by record num
//     10 - save JSON data to sourceURL file on server
// --------------------------------------------------------------------------------------------
function set_record_num (elem, index) {
	this[index].record_num = index;
}
function mapping_records () {
	lnau.data.map(set_record_num, lnau.data);
}

function filter_data_by_key (elem) {
	return elem[worker_keyField] == worker_keyValue;
};
function get_data_by_key (obj) {
	return obj.filter(filter_data_by_key, obj);
};
// -------------------------------------------------------------------------------------------- readingSingleFile
this.readSingleFile = function (get_request, fileURL) {
	get_request = get_transport();
	get_request.onreadystatechange = function() {
		if (get_request.readyState == 4 && get_request.status == 200) {
			var tmp = JSON.parse(get_request.responseText);
			if (tmp.common_data) { lnau.common_data = tmp.common_data; }
			lnau.data = lnau.data.concat(tmp.info);
			worker_counter++;
			if (worker_counter == worker_max_counter_value) {
				mapping_records ();
				postMessage( { header:responseHeader, status:true, result:lnau.common_data } );
			}
		}
		else if (get_request.status == 404 && get_request.readyState == 4) {
			postMessage( { header:responseHeader, status:false, error_message:'XMLHttpRequest error 404' } );
		}
	}
	get_request.open("GET", fileURL, true);
	get_request.send();
}
// --------------------------------------------------------------------------------------------
//			postMessage( { header:responseHeader, status:true } );
// ======================================================================================================== worker_start
this.worker_start = function (src_url, php_url) {
	// if serial => src_url is Array & php_url is Array
	get_request = null;
	post_request = null;
	worker_sourceURL = src_url;
	worker_phpURL = php_url;
	worker_counter = 0;
	
	if (Array.isArray(src_url)) {
		worker_max_counter_value = src_url.length;
		get_request = [];
		post_request = [];
		for (var j = 0; j < src_url.length; j++) {
			this.readSingleFile (get_request[j], src_url[j]);
		}
	}
	else {
		this.readSingleFile (get_request, src_url);
	}
	
}
// =================================================================================================== worker_save_file
this.saveSingleFile = function (postRequest, phpURL, $data) {
	postRequest = get_transport();
	postRequest.onreadystatechange = function() {
		if (postRequest.readyState == 4 && postRequest.status == 200) {
			worker_counter++;
			if (worker_counter == worker_max_counter_value) {
				console.log(responseHeader);
				self.postMessage( { header:responseHeader, status:true } );
			}
		}
		else if (postRequest.status == 404 && postRequest.readyState == 4) {
			self.postMessage( { header:responseHeader, status:false, error_message:'XMLHttpRequest error 404' } );
		}
	}
	
	postRequest.open("POST", phpURL, true);
	postRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	postRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    postRequest.send( JSON.stringify($data) );
}
this.saveData = function () {
	if (Array.isArray(worker_phpURL) && lnau.common_data.saveByKey) {
		post_request = [];
		worker_counter = 0;
		worker_max_counter_value = worker_phpURL.length;
		worker_keyField = lnau.common_data.saveByKey.field;
		for (var j=0; j < worker_phpURL.length; j++) {
			worker_keyValue = lnau.common_data.saveByKey.values[j];
			var tmp = get_data_by_key (lnau.data);
			if (j==0) { tmp = { common_data:lnau.common_data, info:tmp }; }
			else { tmp = { info:tmp }; }
			this.saveSingleFile (post_request[j], worker_phpURL[j], tmp);
		}
	}
	else {
		tmp = { common_data:lnau.common_data, info:lnau.data };
		this.saveSingleFile (post_request, worker_phpURL, tmp );
	}
}

// ====================================================================================================================== 
this.addEventListener('message', function(e) {
	responseHeader = {
		responseType:e.data.request_type,
		recordNum: (e.data.params && Number.isInteger(e.data.params.recordNum))?e.data.params.recordNum:null,
		keyFields: (e.data.params)?(e.data.params.keyFields || undefined):null,
		keyValues: (e.data.params)?(e.data.params.keyValues || undefined):null,
		fields: (e.data.params)?(e.data.params.fields || undefined):null
	};
	switch (responseHeader.responseType) {
		case  0:
		    if (!e.data.src_url || !e.data.php_url) {
				var $err = (!e.data.src_url)?('! Не визначено URL джерела даних'):('');
				$err += (!e.data.php_url)?(' ! Не визначено URL обробника на стороні сервера'):('');
				postMessage( { header:responseHeader, status:false, error_message:$err } );
			}
			this.worker_start (e.data.src_url, e.data.php_url);
			break;
		case  1:
			if (Array.isArray(worker_sourceURL)) { _test = 'worker_counter < worker_sourceURL.length'; }
			else { _test = 'Object.keys(lnau.data).length === 0'; }
			if (eval(_test)) {
				console.log('Данные еще не получены от сервера. Ждем...');
				setTimeout( function() {
					    if (eval(_test)) {
							console.log('Время ожидания истекло...');
							postMessage( { header:responseHeader, status:false, error_message:'Час очікування витік' } ); 
						}
				}, 3000);
			}
			responseHeader.responseType = 1000;
		    responseHeader.responseType += Number.isInteger(responseHeader.recordNum)?100:0;
			
		    $response = Number.isInteger(responseHeader.recordNum)?lnau.data[responseHeader.recordNum]:lnau.data;
			
			//  Запрос на выборку записей по ключам
			
		    if (responseHeader.keyFields && responseHeader.keyValues) {
				responseHeader.responseType += 10;
			    responseHeader.keyFields = (Array.isArray(responseHeader.keyFields))?(responseHeader.keyFields):([responseHeader.keyFields]);
			    responseHeader.keyValues = (Array.isArray(responseHeader.keyValues))?(responseHeader.keyValues):([responseHeader.keyValues]);
				for (var j=0; j < responseHeader.keyFields.length; j++) {
					worker_keyField = responseHeader.keyFields[j];
					worker_keyValue = responseHeader.keyValues[j];
					$response = this.get_data_by_key ($response);
				}
			}
			
			//  Запрос на выборку заданных полей записей
			
			if (responseHeader.fields) {
				responseHeader.responseType += 1;
				responseHeader.fields=(Array.isArray(responseHeader.fields))?(responseHeader.fields):([responseHeader.fields]);
				$response = (Array.isArray($response))?($response):([$response]);
				
				var tmp = [];
				var source_record;
				
				var field;
				for (var j=0; j < $response.length; j++) {
					source_record = $response[j];
					var target_record = {};
					for (var i=0; i < responseHeader.fields.length; i++) {
						field = responseHeader.fields[i];
						target_record[field] = source_record[field];
					}
					tmp[j]= target_record;
				}
				$response = tmp;
				console.log($response);
			}
			
			postMessage( { header:responseHeader, status:true, result:$response } );
			break;
		case  2:
		    // Заменить запись по номеру
			var err1 = !Number.isInteger(e.data.params.recordNum);
			var err2 = !lnau.data[e.data.params.recordNum];
			var err3 = !e.data.params.record;
			if (err1 || err2 || err3) {
				var $error_message=err1?'Не вказаний номер запису':(err3?'Немає даних':'Запису з таким номером не існує');
				postMessage( { header:responseHeader, status:false, error_message:'Заміна запису: ' + $error_message } );
			}
			lnau.data[e.data.params.recordNum] = e.data.params.record;
			postMessage( { header:responseHeader, status:true, result:lnau.data } );
			break;
		case  3:
		    // Заменить записи
			if ( !e.data.params || !e.data.params.data ) {
				postMessage( { header:responseHeader, status:false, error_message:'Заміна даних : Немає даних' } );
			}
			else {
				var tmp = e.data.params.data;
				console.log(tmp);
				for (var j=0; j < tmp.length; j++) {
					var num = tmp.record_num;
					lnau.data[num] = tmp[num];
				}
				postMessage( { header:responseHeader, status:true, result:tmp } );
			}
			break;
		case  4:
		    // Добавить новую запись
		    if (!e.data.params.record) {
				postMessage( { header:responseHeader, status:false, error_message:'Додавання запису : Немає даних' } );
			}
			else {
				lnau.data.push(e.data.params.record);
				var rec_num = lnau.data.length-1;
				lnau.data[rec_num].record_num = rec_num;
				responseHeader.recordNum = rec_num;
				postMessage( { header:responseHeader, status:true, result:lnau.data[rec_num] } );
			}
			break;
		case  5:    
		    // Удалить запись
				
			if (!Number.isInteger(responseHeader.recordNum) || !lnau.data[responseHeader.recordNum]) {
				var $error_message = (!Number.isInteger(responseHeader.recordNum))?('Не визнечено номер запису'):('Запису з таким номером не існує');
				postMessage({ header:responseHeader,status:false,error_message:'Видалення запису: ' + $error_message });
			}
			else {
				lnau.data.splice(responseHeader.recordNum, 1);
				mapping_records ();
				postMessage( { header:responseHeader, status:true, result:lnau.data } );
			}
			break;
		case 10:
		    if ( !e.data.params || !e.data.params.data ) {
				postMessage( { header:responseHeader, status:false, error_message:'Збереження даних: немає даних' } );
			}
			else {
				var tmp = e.data.params.data;
				for (var j=0; j < tmp.length; j++) {
					var num = tmp[j].record_num || j;
					lnau.data[num] = tmp[j];
				}
				// postMessage( { header:responseHeader, status:true, result:tmp } );
			}
			this.saveData ();
			break;
		default:
		    break;
	}
	
});
