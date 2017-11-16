//                                 C O N S T R U C T O R
// -----------------------------------------------------------------------------------------------------
function LNAU_DataBase (dataBaseId) {
		this.sourceURL = '/lnau/json/' + dataBaseId + '.json';
		this.phpURL = '/lnau/php/save_' + dataBaseId + '.php';
		this.common_data = {};
		this.data = {};
		this.tmp = {};
		this.id = dataBaseId;
		this.callback = dataBaseId + '_callback';
		
		// ------------------------------------------------------------------------------ test_response
		this.test_response = function ($response) {
			if (!$response.status) {
				alert($response.error_message);
				var err_msg = [
				    'Помилка створення фонового процесу: ',
					'Помилка збереження даних: ',
					'Помилка читання даних: ',
					'Помилка доступу до даних: '
			    ];
				var err = $response.header.responseType;
				var err_num = (err == 0)?0:((err == 10)?1:((err == 1)?2:3));
				alert(err_msg[err_num] + $response.error_message);
				return false;
			}
			
			if ( lnau.crossDatabaseProcessor.requestTo[this.id].status ) {
				lnau.crossDatabaseProcessor.answerIsReady(this.id, $response.result);
				return;
			}
			switch ($response.header.responseType) {
				case 0:
				    this.worker.ready = true;
					if ($response.result) {
						this.common_data = $response.result;
						for (var j = 0; j < this.common_data.fields.ids.length; j++) {
							this.testFieldReference (this.common_data.fields.ids[j]);
						}
					}
					return true;
					break;
				case 2:
				    // this.data = $response.result;
				    // this.showAllData();
					alert('Запис змінений. Не забудьте зберегти зміни завершенням роботи');
					return true;
					break;
				case 3:
				    alert('Записи змінені. Не забудьте зберегти зміни завершенням роботи');
					return true;
					break;
				case 4:
					this.data = [$response.result];
					document.getElementById('main_content').innerHTML = '';
					this.showFullRecord (0);
					return true;
					break;
				case 5:
					this.data = $response.result;
					this.showAllData();
					return true;
					break;
				case 8:
				    this.data = $response.result;
				    return true;
					break;
				case 10:
				    alert('Дані успішно збережені');
					return true;
					break;
				case 1000:
				    this.data = $response.result;
				    this.showAllData();
					return true;
					break;
				case 1001:
				    this.data = $response.result;
				    this.showAllData();
					return true;
					break;
				case 1010:
				    // records by keys
					this.data = $response.result;
					this.showAllData();
					return true;
					break;
				case 1100:
				    // Record by num
					this.data = (Array.isArray(this.data))?(this.data):([this.data]);
					this.data = this.data.concat([$response.result]);
					this.showFullRecord (this.data.length-1);
					return true;
					break;
				default:
					alert('Warning: unknown worker answer type: ' + $response.header.responseType);
					return false;
					break;
			}
		};
		// -------------------------------------------------------------------------------- createWorkerInstance
		this.createWorkerInstance = function (callback) {
			try {
				this.worker = new Worker('/lnau/js/json_loader_multydata.js');
				this.worker.id = dataBaseId;
				this.worker.addEventListener('message', function(e) {
					if (!e.data.status) {
						if (e.data.error_message == 'no URL') { alert('Помилка: не отриманий URL'); }
						else { alert(e.data.error_message); }
					}
					else { window[callback](e.data); }
				});
				this.worker.postMessage( { request_type:0, src_url:this.sourceURL, php_url:this.phpURL } );
			}
			catch (err) {
				alert("Будь ласка, відновите браузер. На жаль, у Вашому браузері повна функціональність неможлива");
			}
		};
		// ----------------------------------------------------------------------------------------------- closeWorker
		this.closeWorker = function () {
			this.worker.terminate();
			this.worker = undefined;
		};
		
		// ----------------------------------------------------------------------------------------------- sendRequest
		this.sendRequestForAllData = function () {
			document.getElementById('main_content').innerHTML = '';
			var notice = document.createElement('div');
			notice.id = "lnau_notice";
			notice.style.position = 'fixed';
			notice.style.bottom = '0';
			notice.style.right = '0';
			notice.style.width = 'auto';
			notice.style.height = 'auto';
			notice.style.padding = '2px 10px';
			notice.style.backgroundColor = 'black';
			document.getElementById('main_content').appendChild(notice);
			
			notice.innerHTML = '<h3>Почекайте, будь ласка...</h3>';
			this.worker.postMessage( { request_type:1 } );
		};
		this.sendRequestToDeleteAllData = function () {
			this.worker.postMessage( { request_type:8 } );
		}
		// ------------------------------------------------------------------------------------ sendRequestForRecodByNum
		this.sendRequestForRecodByNum = function (recordNum) {
			if (!Number.isInteger(recordNum)) { alert('Не відмічено жодного запису'); return; }
			this.worker.postMessage( { request_type:1, params: { recordNum:recordNum } } );
		};
		this.sendRequestToDeleteRecodByNum = function (recordNum) {
			this.worker.postMessage( { request_type:5, params: { recordNum:recordNum } } );
		};
		this.sendRequestToAppendNewRecord = function ($record) {
			this.worker.postMessage( { request_type:4, params: { record:$record } } );
		};
		this.sendRequestToSaveData = function () {
			//this.sendRequestToUpdateData ();
			this.worker.postMessage( { request_type:10, params:{ data:this.data } } );
		}
		this.sendRequestForFields = function (fields) {
			if (!fields) { alert('Не вказано поле запису'); return; }
			this.worker.postMessage( { request_type:1, params: { fields:fields } } );
		};
		// ---------------------------------------------------------------------------------- sendRequestForRecodsByKeys
		this.sendRequestForRecodsByKeys = function () {
			
			if (!this.common_data.selection) { return false; }
			
			var keyFields = [];
			var labels = [];
			this.common_data.selection.keyValues = [];
			
			selectionWindow = lnau_lib.constructPopupWindow('Параметри вибору записів');
			for (var j = 0; j < this.common_data.selection.keyFields.length; j++) {
				
				keyFields[j] = this.common_data.selection.keyFields[j];
				labels[j] = this.getFieldName(keyFields[j]);
				this.common_data.selection.keyValues[j] = null;
				var selectionPoint = this.getInputField (1, j, keyFields[j]);
				selectionWindow.content.appendChild(selectionPoint);
			}
			var btn = document.createElement('button');
			btn.innerHTML = 'OK';
			btn.workerObj = this.worker;
			btn.params = {
				targetId: this.id,
				keyFields:keyFields,
				keyValues:this.common_data.selection.keyValues,
				_labels:labels,
				func:this.isEmptyValue
			};
			btn.ret = { fields: [], values: [] };
			btn.onclick = function (event) {
				var but = event.target;
				selectionWindow.parentNode.removeChild(selectionWindow);
				var k = 0;
				var html = '<h3>' + lnau[but.params.targetId].common_data.name + '</h3>';
				
				for ( var j = 0; j < but.params.keyFields.length; j++ ) {
					
					if (!but.params.func(but.params.keyValues[j])) {
						but.ret.fields[k] = but.params.keyFields[j];
						but.ret.values[k] = but.params.keyValues[j];
						html += but.params._labels[j] + '&nbsp;' + but.params.keyValues[j];
						k++;
					}
				}
				document.getElementById("lnau_notice").innerHTML = html;
				if (but.ret.fields.length == 0) { alert('Ви не визначили параметри відбору записів'); return false; }
				but.workerObj.postMessage({request_type:1, params:{ keyFields:but.ret.fields, keyValues:but.ret.values} });
			};
			selectionWindow.appendChild(btn);
			document.body.appendChild(selectionWindow);
		};
		// ----------------------------------------------------------------------------- sendRequestToUpdateRecodByNum
		this.sendRequestToUpdateRecodByNum = function (_recordNum, _data) {
			// replace record by recordNum
			if (!_data) { alert('Немає даних для заміни'); return; }
			var recordNum = _recordNum || _data.record_num;
			if (!recordNum) { alert('Не вказаний номер запису'); return; }
			
			this.worker.postMessage( { request_type:2, params: { recordNum:recordNum, record:_data } } );
		};
		// ----------------------------------------------------------------------------------- sendRequestToUpdateData
		this.sendRequestToUpdateData = function () {
			// replace record by recordNum
			if (!this.data) { alert('Немає даних для заміни'); return; }
			this.worker.postMessage( { request_type:3, params: { data:this.data } } );
		};
		// ----------------------------------------------------------------------------- sendRequestToDeleteRecodByNum
		this.sendRequestToDeleteRecodByNum = function (recordNum) {
			this.worker.postMessage( { request_type:5, params: { recordNum:recordNum } } );
		};
		// --------------------------------------------------------------------------------------------- Редактирование
		this.isEmptyValue = function (_value) {
			if (Number.isInteger(_value)) { return false; }
			if (!_value) { return true; }
			if (typeof _value === 'string' && _value.length == 0) { return true; }
		};
		// ------------------------------------------------------------------------------------------- testFieldType
		this.testFieldType = function ($field) {
			var typ = typeof $field;
			if (typ == 'object') { typ = Array.isArray($field)?'array':typ; }
			return typ;
		};
		// ------------------------------------------------------------------------------------------- appendNewRecord
		this.appendNewRecord = function () {
			// var newRecord = this.common_data.initial_record;
			if ( this.common_data.code_field ) {
				var d1 = new Date(2017, 1, 15, 11, 0, 0, 0);
				var d2 = new Date();
				this.common_data.initial_record[this.common_data.code_field] = d2.getTime() - d1.getTime();
			}
			//if (Number.isInteger(this.common_data.initial_record.code)) {
			//	var d1 = new Date(2017, 1, 15, 11, 0, 0, 0);
			//	var d2 = new Date();
			//	this.common_data.initial_record.code = d2.getTime() - d1.getTime();
			//}
			this.worker.postMessage( { request_type:4, params: { record:this.common_data.initial_record } } );
		};
		// ============================================================================================= isReference
		//  Проверка поля, является ли оно ссылкой на другую базу данных
		this.isReference = function (fieldName) {
			var fieldNum = this.getFieldIndex(fieldName);
			var refs = this.common_data.fields.ref;
			if ( !refs || !refs[fieldNum] ) { return false; }
			return refs[fieldNum];
		}
		// ======================================================================================= testFieldReference
		//  Проверка поля, является ли оно ссылкой на другую базу данных
		//  если да, то загрузка необходимых данных из базы справочника
		//  в переменную this.common_data[fieldName]
		//  
		this.testFieldReference = function (fieldName) {
			
			var ref = this.isReference (fieldName);
			if (!ref) { return false; }
			var responderId = ref.baseId;
			
			var params = {
				callback_params: {
					requestedField: fieldName,
					codeField: ref.codeField,
					dataField: ref.dataField,
					sqlField: ref.sqlField
				},
				callback: function (responderId, _params) {
					var requesterId = lnau.crossDatabaseProcessor.answerFrom[responderId].target;
					
					if (!requesterId) { return; }
					var ref = lnau[requesterId].common_data;
					var $data = lnau.crossDatabaseProcessor.getAnswer(responderId);
					
					if (!$data) { return false; }
					lnau[requesterId].common_data[_params.requestedField] = {};
					for (var recNum = 0; recNum < $data.length; recNum++) {
						var _code = $data[recNum][_params.codeField];
						var _data = $data[recNum][_params.dataField];
						var _sql  = $data[recNum][_params.sqlField];
						lnau[requesterId].common_data[_params.requestedField][_code] = { data:_data, sql:_sql };
					}
					// 
					var test = lnau[requesterId].common_data[_params.requestedField];
				}
			};
			
			lnau.crossDatabaseProcessor.sendRequest (this.id, ref.baseId, params);
		};
		// ==================================================================================== showFieldsAsTable
		this.showDataAsTable = function ($caption, $fields, $labels) {
			var $table = document.createElement('table');
			$table.appendChild(document.createElement('caption'));
			$table.caption.innerHTML = $caption;
			$table.caption.className = "green";
			$table.cellspacing = '2';
			$table.cellpadding = '4';
			document.getElementById("main_content").innerHTML = '';
			document.getElementById("main_content").appendChild($table);
			var row = $table.insertRow(0);
			for (var cellNum = 0; cellNum < $fields.length+1; cellNum++) {
				var cell = row.insertCell(cellNum);
				cell.className = "magenta";
				cell.innerHTML = ( cellNum == 0 ) ? '' : $labels[cellNum-1];
			}
			for (var rowNum = 0; rowNum < this.data.length; rowNum++) {
				
				var row = $table.insertRow(rowNum+1);
				// ---------- checkbox -------------------
				var cell = row.insertCell(0);
				var $checkBox = document.createElement('input');
				$checkBox.type = "checkbox";
				$checkBox.name = "lnau_selRecord";
				$checkBox.title = "Вибрати";
				$checkBox.value = this.data[rowNum].record_num;
				cell.appendChild ($checkBox);
				for (var cellNum = 0; cellNum < $fields.length; cellNum++) {
					var cell = row.insertCell(cellNum+1);
					cell.style.color = 'black';
					cell.style.border = 'solid 1px gray';
					var _value = this.getFieldValue (rowNum, $fields[cellNum]);
					if (!_value) { cell.innerHTML = ''; }
					else {
						if ( typeof _value == 'string' || typeof _value == 'number' ) {
							cell.innerHTML = _value; 
						}
						else {
							cell.appendChild(_value);
						}
					}
				}
			}
		}
		// ------------------------------------------------------------------------------------------- showAllData
		this.showAllData = function () {
			if (!this.data || this.data.length === 0) {
				document.getElementById("lnau_notice").innerHTML = "Дані відсутні";
				return;
			}
			document.getElementById("lnau_notice").style.color = 'white';
			document.getElementById("lnau_notice").innerHTML = '<h3>' + this.common_data.name + '</h3>';
			
			//  Проверка, что выбрана табличная форма вывода
			var tableForm = document.getElementsByName("lnau_tableForm").item(0).checked;
			var caption = this.common_data.name;
			//  Test for query selection
			if (this.common_data.selection && this.common_data.selection.keyValues) {
				var fieldsList = this.common_data.selection.fieldsToShow; 
				for (var j=0; j < this.common_data.selection.keyFields.length; j++) {
					var _field = this.getFieldName(this.common_data.selection.keyFields[j]);
					var _value = this.common_data.selection.keyValues[j];
					
					if(this.common_data[this.common_data.selection.keyFields[j]]) {
						_value = this.common_data[this.common_data.selection.keyFields[j]][_value];
					}
					var html = (_value)?(_field + ': ' + _value + '&nbsp;&nbsp;'):("");
					document.getElementById("lnau_notice").innerHTML += html;
				}
			}
			else {
				var fieldsList = (this.common_data.full_list)?(this.common_data.full_list.fieldsToShow):(this.common_data.fields.ids);
			}
			// --------------- table form ----------------
			if (tableForm) {
				
				var $labels = [];
				for (var j = 0; j < fieldsList.length; j++) {
					$labels[j] = this.common_data.fields.names[this.getFieldIndex (fieldsList[j])];
				}
				this.showDataAsTable (caption, fieldsList, $labels);
				return;
			}
			// --------------- sections form ----------------- 
			for (var recNum = 0; recNum < this.data.length; recNum++) {
				var section = document.createElement('section');
				var $checkBox = document.createElement('input');
				$checkBox.type = "checkbox";
				$checkBox.name = "lnau_selRecord";
				$checkBox.title = "Вибрати";
				$checkBox.value = this.data[recNum].record_num;
				
				for (var fieldIndex = 0; fieldIndex < fieldsList.length; fieldIndex++) {
					if ( this.isReference (fieldsList[fieldIndex]) ) {
						elem = document.createElement('p');
						elem.className = 'green';
						elem.innerHTML = this.getReferenseFieldValue (recNum, fieldsList[fieldIndex]);
					}
					else {
						elem = this.getInputField (0, recNum, fieldsList[fieldIndex]);
					}
					section.appendChild(elem);
				}
				document.getElementById('main_content').appendChild(section);
				section.appendChild($checkBox);
			}
		};
		// ================================================================================ getReferenseFieldValue
		this.getReferenseFieldValue = function (recordNum, fieldName) {
			
			var lib = this.common_data[fieldName];
			
			var $code = this.data[recordNum][fieldName];
			
			var _res = lib[$code]?lib[$code].data:'<span style="color:red">Значення не визначене</span>';
			
			return _res;
		};
		// ================================================================================ getReferenseFieldInput
		this.getReferenseFieldInput = function (recordNum, fieldName) {
			
			var fieldIndex = this.getFieldIndex(fieldName);
			
			var sqlField = this.common_data.fields.ref[fieldIndex].sqlField;
			var dataField = this.common_data.fields.ref[fieldIndex].dataField;
			var codeField = this.common_data.fields.ref[fieldIndex].codeField;
			
			var sqlValue = this.data[recordNum][sqlField];
			
			var keys = Object.keys(this.common_data[fieldName]);        //  массив ключей
			
			var listOptions = [];
			
			if (!this.isEmptyValue(sqlValue)) {
				for ( var itemNum = 0; itemNum < keys.length; itemNum++ ) {
					var _item = this.common_data[fieldName][keys[itemNum]];
					if ( _item.sql == sqlValue ) {
						var $option = { html:'', value:'' };
						$option.value = keys[itemNum];
						$option.html = _item.data;
						listOptions = listOptions.concat($option);
					}
				}
			}
			else {
				for ( var itemNum = 0; itemNum < keys.length; itemNum++ ) {
					var _item = this.common_data[fieldName][keys[itemNum]];
					var $option = { html:'', value:'' };
					$option.value = keys[itemNum];
					$option.html = _item.data;
					listOptions = listOptions.concat($option);
				}
			}
			
			var _select = document.createElement('select');
			_select.obj = this.data[recordNum];
			_select.field = fieldName;
			
			for (var i = 0; i < listOptions.length; i++) {
				var _option = document.createElement('option');
				_option.value = listOptions[i].value;
				_option.innerHTML = listOptions[i].html;
				_select.appendChild(_option);
			}
			_select.value = this.data[recordNum][fieldName];
			_select.onchange = function (event) {
				this.obj[this.field] = this.value;
			}
			return _select;
		};
		// ------------------------------------------------------------------------------------------- getFieldValue
		this.getFieldValue = function (recordNum, $field) {
			var fieldIndex = this.getFieldIndex($field);
			
			if ( this.common_data.fields.ref && this.common_data.fields.ref[fieldIndex] ) {
				// 
				if ( this.common_data.fields.ref[fieldIndex].source_sql_field ) {
					var params = {
						record:            this.data[recordNum],
						record_sql_field:  this.common_data.fields.ref[fieldIndex].source_sql_field,
						record_data_field: $field,
						library:           this.common_data[$field],
						lib_sql_field:     'sql',
						lib_data_field:    'data'
					};
					return lnau_lib.create_selection_field ( params );
				}
				else {
					var _value = this.getReferenseFieldValue (recordNum, $field);
				}
				
				return '<span style="color:#055">' + _value + '</span>';
			}
			if ( this.common_data[$field] ) {
				var ret = this.common_data[$field][this.data[recordNum][$field]];
				return ret?ret:'<span style="color:red">Не указано</span>';
			}
			return this.data[recordNum][$field];
		};
		
		// ------------------------------------------------------------------------------------------- showRecord
		this.showFullRecord = function (recordIndex, _but) {
			var _section = document.createElement('section');
			for (var j=0; j < this.common_data.fields.ids.length; j++) {
				var elem = this.getInputField (0, recordIndex, this.common_data.fields.ids[j]);
				_section.appendChild(elem);
			}
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.innerHTML = 'OK';
			btn.sectionId = this.id;
			btn.record = this.data[recordIndex];
			btn.recordNum = this.data[recordIndex].record_num;
			_section.appendChild(btn);
			btn.onclick = function (event) {
				var obj = lnau[event.target.sectionId];
				obj.sendRequestToUpdateRecodByNum (event.target.recordNum, event.target.record);
			}
			if (_but) { _section.appendChild(_but); }
			document.getElementById('main_content').appendChild(_section);
		};
		// ============================================================================================
		this.buildFullRecordElement = function ($data) {
			var elem = document.createElement('aside');
			elem.style.float = 'right';
			elem.style.border = 'inset 1px';
			elem.style.width = '40%';
			elem.style.height = window.innerHeight*0.55 + 'px';
			elem.style.padding = '10px';
			elem.style.overflow = 'auto';
			elem.style.boxSizing = 'border-box';
			
		};
		// ------------------------------------------------------------------------------------------- getInputField
		this.getParamForFilterRecords = function ($field) {
			
			var fieldLabel = this.getFieldName($field);
			var _container = document.createElement('div');
			var _span = document.createElement('span');
			_span.className = 'magenta';
			_span.innerHTML = fieldLabel;
			_container.appendChild(_span);
			
			var inputField = this.common_data[$field]?document.createElement('select'):document.createElement('input');
			_container.appendChild(inputField);
			return _container;
		};
		// ----------------------------------------------------------------------------------------- createDataListField
		this.createDataListField = function ($field, fieldValue) {
			var inputField = document.createElement('select');
			var _option = document.createElement('option');
			_option.innerHTML = '...';
			_option.value = null;
			inputField.appendChild(_option);
			for (var i=0; i < this.common_data[$field].length; i++) {
				var _option = document.createElement('option');
				_option.value = i;
				_option.innerHTML = this.common_data[$field][i];
				inputField.appendChild(_option);
			}
			return inputField;
		};
		// -------------------------------------------------------------------------------------------- createSelectField
		this.createSelectField = function ($field, fieldValue) {
			var inputField = document.createElement('select');
			var _option = document.createElement('option');
			_option.innerHTML = '...';
			_option.value = null;
			inputField.appendChild(_option);
			for (var i=0; i < this.common_data[$field].length; i++) {
				var _option = document.createElement('option');
				_option.value = i;
				_option.innerHTML = this.common_data[$field][i];
				inputField.appendChild(_option);
			}
			inputField.onchange = function (event) { this.obj[this.index] = this.value; }
			return inputField;
		};
		// -------------------------------------------------------------------------------------------- createTextField
		this.createTextField = function ($field, fieldValue) {
			var fieldIndex = this.getFieldIndex ($field);
			var inputField = document.createElement('input');
			inputField.type = 'text';
			inputField.value = fieldValue;
			inputField.style.width = this.common_data.fields.len[fieldIndex];
			inputField.onchange = function (event) { this.obj[this.index] = this.value; }
			return inputField;
		};
		// -------------------------------------------------------------------------------------------- createCheckBoxes
		this.createCheckBoxes = function (recordNum, $field, fieldValues) {
			var fieldIndex = this.getFieldIndex ($field);
			var inputField = document.createElement('table');
			inputField.style.float = 'left';
			var _caption = inputField.createCaption();
			_caption.innerHTML = this.common_data[$field].label;
			_caption.className = 'magenta';
			
			var _header = inputField.createTHead();
			var h_cell = document.createElement('th');
			_header.appendChild(h_cell);
			for (var j=1; j < this.common_data[$field].col_names.length+1; j++) {
				var h_cell = document.createElement('th');
				_header.appendChild(h_cell);
				h_cell.innerHTML = this.common_data[$field].col_names[j-1];
				h_cell.className = 'green';
			}
			for (var rowNum = 0; rowNum < this.common_data[$field].row_names.length; rowNum++) {
				var row = inputField.insertRow(rowNum);
				var h_cell = row.insertCell(0);
				h_cell.className = 'green';
				h_cell.innerHTML = this.common_data[$field].row_names[rowNum];
				for (var sellNum = 1; sellNum < this.common_data[$field].col_names.length+1; sellNum++) {
					var _cell = row.insertCell(sellNum);
					var chkbx = document.createElement('input');
					chkbx.type = 'checkbox';
					chkbx.checked = fieldValues[rowNum][sellNum-1];
					chkbx.style.width = '20px';
					chkbx.style.height = '20px';
					_cell.appendChild(chkbx);
					chkbx.obj = this.data[recordNum][$field];
					chkbx.index1 = rowNum;
					chkbx.index2 = sellNum-1;
					chkbx.onchange = function (event) { this.obj[this.index1][this.index2] = this.checked; }
				}
			}
			return inputField;
		};
		// -------------------------------------------------------------------------------------------- getInputField
		this.getInputField = function (objType, recNum, $field) {
			// objType = 0 - поле ввода значений массива this.data:   this.data[recNum][$field]
			// objType = 1 - поле ввода критериев отбора записей:   this.common_data.selection.keyValues[recNum]
			
			var fieldValue = (objType == 0)?this.data[recNum][$field]:null;
			var fieldLabel = this.getFieldName($field) || "";
			var fieldIndex = this.getFieldIndex($field);
			var fieldRef = this.common_data.fields.ref?this.common_data.fields.ref[fieldIndex]:null;
			
			var _container = document.createElement('div');
			var _label = document.createElement('span');
			_label.innerHTML = fieldLabel + ' ';
			_label.style.color = '#960064';
			_container.appendChild(_label);
			
			// ---------------------- field couldn't be edit --------------------------------
			if ( this.common_data.fields.edit && !this.common_data.fields.edit[fieldIndex]) {
				var inputField = document.createElement('span');
				inputField.innerHTML = fieldValue;
				inputField.style.color = '#555';
				_container.appendChild(inputField);
				return _container;
			}
			// -------------- field value is reference to another database ------------------
			if ( this.common_data.fields.ref && this.common_data.fields.ref[fieldIndex] ) {
				// 
				if ( this.common_data.fields.ref[fieldIndex].source_sql_field ) {
					// 
					var params = {
						record:            this.data[recNum],
						record_sql_field:  this.common_data.fields.ref[fieldIndex].source_sql_field,
						record_data_field: $field,
						library:           this.common_data[$field],
						lib_sql_field:     'sql',
						lib_data_field:    'data'
					};
					var inputField = lnau_lib.create_selection_field ( params );
					_container.appendChild ( inputField );
					return _container;
				}
				else {
					var _value = this.getReferenseFieldValue (recNum, $field);
				}
				_container.innerHTML += '<span style="color:#055">' + _value + '</span>';
				return _container;
			}
			
			// --------- field is a set of checkboxes or reference to inner list of values ---------
			
			if (this.common_data[$field]) {
				// ---------- the field is a set of checkboxes ---------------
				if (this.common_data[$field].type && this.common_data[$field].type  == 'checkboxes') {
					var fieldLabel = this.common_data[$field].label;
					var boxesValues = fieldValue;
					var inputField = this.createCheckBoxes (recNum, $field, boxesValues);
					_container.style.float = 'left';
				}
				else {
					// the value should be selected from the list
					inputField = this.createSelectField ($field,fieldValue);
				}
			}
			else {
				// simple input field
				var inputField = this.createTextField ($field,fieldValue);
			}
			_container.appendChild(inputField);
			
			inputField.value = fieldValue;
			
			inputField.obj = (objType == 0)?this.data[recNum]:this.common_data.selection.keyValues;
			inputField.index = (objType == 0)?$field:this.common_data.selection.keyFields.indexOf($field);
			inputField.onchange = function (event) {
				this.obj[this.index] = this.value;
			}
			return _container;
		};
		// ------------------------------------------------------------------------------------------- 
		this.getFieldName = function ($field) {
			return this.common_data.fields.names[this.getFieldIndex($field)];
		};
		this.getFieldType = function ($field) {
			
		};
		this.getFieldLength = function ($field) {
			return this.common_data.fields.len[this.getFieldIndex($field)];
		};
		this.getFieldIndex = function ($field) {
			return this.common_data.fields.ids.indexOf($field);
		};
		// --------------------------------------------------------------------------------------- testSelectedRecords
		this.testSelectedRecords = function () {
			var $ret = [];
			this.tmp = [];
			var k = 0;
			var sel = false;
			var selectionBoxes = document.getElementsByName("lnau_selRecord");
			for (var j=0; j < selectionBoxes.length; j++) {
				if (selectionBoxes[j].checked) {
					sel = true;
					$ret[k] = this.data[j].record_num;
					this.tmp[k] = this.data[j];
					k++;
				}
			}
			if (!sel) {
				alert('Помилка: Ви не відмітили жодного запису');
				return null;
			}
			document.getElementById("main_content").innerHTML = '';
			return $ret;
		};
		// --------------------------------------------------------------------------------------- getSelectedRecords
		this.getSelectedRecords = function () {
			
			var selectedRecordsNums = this.testSelectedRecords ();
			if (!selectedRecordsNums) { return; }
			this.data = [];
			for (var j=0; j < selectedRecordsNums.length; j++) {
				this.sendRequestForRecodByNum (selectedRecordsNums[j]);
			}
		};
		// --------------------------------------------------------------------------------------- removeSelectedRecords
		this.removeSelectedRecords = function () {
			
			var selectedRecordsNums = this.testSelectedRecords ();
			if (!selectedRecordsNums) { return; }
			var x = confirm("Ви упевнені, що хочете видалити відмічені записи?");
			if (!x) { return; }
			var k = 0;
			for (var j=0; j < selectedRecordsNums.length; j++) {
				this.sendRequestToDeleteRecodByNum (selectedRecordsNums[j]-k);
				k++;
			}
			this.showAllData();
		};
		this.buildList = function () {
			var $field = this.common_data.main_field;
			var sel_list = document.createElement('select');
			sel_list.id = 'lnau_' + this.id + '_main_list';
			sel_list.obj = this.common_data;
			for (var j=0; j < this.data.length; j++) {
				var _option = document.createElement('option');
				_option.innerHTML = this.data[j][$field];
				_option.value = j;
				sel_list.appendChild(_option);
			}
			sel_list.onchange = function (event) {
				this.obj.selectedRecord = this.value;
			}
		};
		this.indexingBD = function (indexFieldName) {
			var d1 = new Date(2017, 1, 20, 11, 0, 0, 0);
			for (var rowNum = 0; rowNum < this.data.length; rowNum++) {
				var d2 = new Date();
				this.data[rowNum][indexFieldName] = (d2.getTime() - d1.getTime() + rowNum);
			}
			this.worker.postMessage( { request_type:7, params: { data: this.data } } );
		}
}
