lnau.funcs = {
	
	request_for_dicsiplines_list: function () {
		var params = {
			callback: function (responderId) {
				document.getElementById("main_content").innerHTML = '';
				var $data = lnau.crossDatabaseProcessor.getAnswer('disciplines');
				if (!$data) { alert ('Дані не отримані'); return false; }
				lnau.disciplinesList.data = lnau_lib.testArrayForRepeatedValues($data, ['kafedra', 'discipline']);
				
				var $table = document.createElement('table');
				$table.appendChild(document.createElement('caption'));
				$table.caption.innerHTML = "Довідник дисциплін";
				$table.caption.className = "magenta";
				$table.cellspacing = '5';
				var fields = [ "kafedra", "code", "discipline" ];
				
				var row = $table.insertRow(0);
				var cell = row.insertCell(0);
				cell.className = 'magenta';
				cell.innerHTML = "Кафедра";
				var cell = row.insertCell(1);
				cell.className = 'magenta';
				cell.innerHTML = "Шифр дисципліни";
				var cell = row.insertCell(2);
				cell.className = 'magenta';
				cell.innerHTML = "Назва дисципліни";
				
				var d1 = new Date(2017, 1, 15, 11, 0, 0, 0);
				for (var rowNum = 0; rowNum < lnau.disciplinesList.data.length; rowNum++) {
					var d2 = new Date();
					lnau.disciplinesList.data[rowNum].code = (d2.getTime() - d1.getTime() + rowNum);
					var row = $table.insertRow(rowNum+1);
					for (var cellNum = 0; cellNum < fields.length; cellNum++) {
						var cell = row.insertCell(cellNum);
						cell.style.color = 'black';
						cell.innerHTML = lnau.disciplinesList.data[rowNum][fields[cellNum]];
						cell.style.border = 'solid 1px gray';
					}
				}
				document.getElementById("main_content").appendChild($table);
				var btn = document.createElement('button');
				btn.innerHTML = 'Зберегти в довіднику';
				
				btn.onclick = function () {
					lnau.dicsiplinesList.worker.sendRequestToSaveData ();
				}
			}
		}
		lnau.crossDatabaseProcessor.sendRequest('disciplinesList', 'disciplines', params);
	},
	// ========================================================================================== set_dicsiplines_codes
	set_dicsiplines_codes: function () {
		var params = {
			callback: function (responderId) {
				var $data = lnau.crossDatabaseProcessor.getAnswer('disciplinesList');
				if (!$data) { alert ('Дані не отримані'); return false; }
				var fieldIndex = null;
				for (var i = 0; i < lnau.disciplines.common_data.fields.ref.length; i++) {
					if (lnau.disciplines.common_data.fields.ref[i]) {
						fieldIndex = i;
						break;
					}
				}
				var codeField = lnau.disciplines.common_data.fields.ref[fieldIndex].codeField;
				var dataField = lnau.disciplines.common_data.fields.ref[fieldIndex].dataField;
				
				for (var recNum = 0; recNum < lnau.disciplines.data.length; recNum++) {
					for (var listIndex = 0; listIndex < $data.length; listIndex++) {
						if ($data[listIndex][dataField] == lnau.disciplines.data[recNum][dataField]) {
							lnau.disciplines.data[recNum][codeField] = $data[listIndex][codeField];
							delete lnau.disciplines.data[recNum].discipline;
							break;
						}
					}
				}
				lnau.disciplines.sendRequestToSaveData ();
			}
		}
		lnau.crossDatabaseProcessor.sendRequest('disciplines', 'disciplinesList', params);
	},
    // ------------------------------------------------------------------------------------------ get_dicsiplinesList
	get_dicsiplinesList: function (requesterId) {
		var params = {
			callback: function (responderId, params) {
				var $data = lnau.crossDatabaseProcessor.getAnswer('disciplinesList');
				if (!$data) { alert ('Дані не отримані'); return false; }
				
			}
		}
	},
	// ----------------------------------------------------------------------------- request_for_dicsiplines_of_group
	request_for_dicsiplines_of_group: function () {
			var semestr = prompt ('Семестр: ', 1);
			if (semestr && (semestr == 1 || semestr == 2)) {
				var states = ['6.', '8.', '7.'];
				var _record = lnau.groups.data[0];
				var _speciality = states[_record.state] + _record.speciality;
				var params = {
					students: _record.students,
					callback: function (responderId) {
						var $data = lnau.crossDatabaseProcessor.getAnswer('disciplines');
						if (!$data) { alert ('Дані не отримані'); return false; }
						var students = lnau.groups.data[0].students;
						var fields = [ "code", "kafedra", "hours", "hours_fact", "hours_prev", "hours_now", "hours_next",
						               "hours_auditorial", "lectures", "laboratory", "practice", "self_work", "corse_work",
									   "rgr", "exam", "credit", "control_work" ];
						var labels = [ "Дисципліна", "Кафедра", "Годин", "Факт.год.", "У минулому семестрі",
							           "У поточному семестрі", "У наступному семестрі", "Всього ауд.год.", "Лекції", 
									   "Лаб. зан.", "Практ. зан.", "Самост. роб.", "Курс. роб. (пр.)", "РГР", 
									   "Екзам.", "Залік", "Контр. роботи" ];
						var $table = document.createElement('table');
						$table.appendChild(document.createElement('caption'));
						$table.caption.innerHTML = "Семестр: " + semestr;
						$table.caption.className = "green";
						$table.cellspacing = '1';
						$table.cellpadding = '10';
						
						var row = $table.insertRow(0);
						for (var cellNum = 0; cellNum < fields.length+1; cellNum++) {
							var cell = row.insertCell(cellNum);
							cell.className = "magenta";
							cell.innerHTML = labels[cellNum];
						}
						for (var rowNum = 0; rowNum < $data.length; rowNum++) {
							var row = $table.insertRow(rowNum+1);
							if ( students < 7 ) {
								$data[rowNum].hours_auditorial = $data[rowNum].hours_fact * 0.1;
								$data[rowNum].lectures = 0;
								$data[rowNum].laboratory = 0;
								$data[rowNum].practice = 0;
								$data[rowNum].self_work = $data[rowNum].hours_fact - $data[rowNum].hours_auditorial;
							}
							for (var cellNum = 0; cellNum < fields.length; cellNum++) {
								var cell = row.insertCell(cellNum);
								cell.style.color = 'black';
								cell.style.border = 'solid 1px gray';
								
								switch ( fields[cellNum] ) {
									case 'code':
									   cell.innerHTML = lnau.disciplines.common_data.code[$data[rowNum].code].data;
									   break;
									default:
									   cell.innerHTML = $data[rowNum][fields[cellNum]];
									   break;
								}
							}
						}
						document.getElementById("main_content").appendChild($table);
					},
					fields: ['course','form_of_study','duration','speciality_1','semestr'],
					values: [_record.course, _record.form_of_study, _record.duration, _speciality, semestr*1]
				};
				lnau.crossDatabaseProcessor.sendRequest('groups', 'disciplines', params);
			}
	},
	// ------------------------------------------------------------------------------------- create_summary_database
	create_summary_database: function () {
		
		var states = ['6.', '8.', '7.'];
		
		lnau.section.is_active.summary = true;
		lnau.summary.data = [];
		lnau.summary.sendRequestToDeleteAllData ();
		// Запрос к lnau.groups
		var params = {
			callback: function (responderId) {
				// Получен ответ от lnau.groups
				var $groups = lnau.crossDatabaseProcessor.getAnswer('groups');
				// Создаем очередь запросов
				lnau.summary.request_queue = [];
				lnau.summary.requestIndex = -1;
				var _params = {
					fields: ['course','form_of_study','duration','speciality_1'],
					// обработчик события получения данных по группе из базы disciplines
					callback: function ( responderId, _params ) {
						lnau.summary.requestIndex++;
						var $data = lnau.crossDatabaseProcessor.getAnswer('disciplines');
						
						if (!$data) { console.info ('Нет данных'); return false; }
						for (var i = 0; i < $data.length; i++) {
							lnau.summary.data.push ({
								group_name: lnau.summary.request_queue[lnau.summary.requestIndex].group_name,
								students: lnau.summary.request_queue[lnau.summary.requestIndex].students,
								semestr: $data[i].semestr,
								discipline: $data[i].code,
								kafedra: $data[i].kafedra,
								teacher: null,
								hours: $data[i].hours_auditorial
							});
							//
							lnau.summary.sendRequestToAppendNewRecord ({
								group_name: lnau.summary.request_queue[lnau.summary.requestIndex].group_name,
								students: lnau.summary.request_queue[lnau.summary.requestIndex].students,
								semestr: $data[i].semestr,
								discipline: $data[i].code,
								kafedra: $data[i].kafedra,
								teacher: null,
								hours: $data[i].hours_auditorial
							});
						}
					}
				};
				
				for (var j = 0; j < $groups.length; j++) {
					
					var _speciality = ( !$groups[j].speciality )?$groups[j].direction:$groups[j].speciality;
					_speciality = (typeof _speciality !== 'string')?(_speciality.toString()):(_speciality);
					var z = _speciality.indexOf('.');
					_speciality = (z < 0)?(states[$groups[j].state] + _speciality):(_speciality);
					lnau.summary.request_queue.push ({
						group_name: $groups[j].group_name,
						students: $groups[j].students,
						values: [
							$groups[j].course,
							$groups[j].form_of_study,
							$groups[j].duration,
							_speciality
						]
					});
				}
				_queue = lnau.summary.request_queue;
				lnau.crossDatabaseProcessor.createRequestQueue ('summary', 'disciplines', _params, _queue);
			}
		};
		lnau.crossDatabaseProcessor.sendRequest('summary', 'groups', params);
	},
	// -------------------------------------------------------------------------------------------- summary_callback
	summary_table: function () {
		// Зведена таблиця в широкому варіанті
		var semestr = prompt ('Семестр: ', 1);
		if ( !semestr || semestr < 1 || semestr > 2 ) { alert("Неправильно вказаний семестр"); return false; }
		
		var _groups = [];
		var _disciplines = [];
		
		var $table = document.createElement('table');
		document.getElementById("main_content").innerHTML = '';
		document.getElementById("main_content").appendChild($table);
		$table.appendChild(document.createElement('caption'));
		$table.caption.innerHTML = "Семестр: " + semestr;
		$table.caption.className = "green";
		$table.cellspacing = '1';
		$table.cellpadding = '10';
		$table.style.color = 'black';
		var row = $table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = 'Дисципліни';
		for (var recNum = 0; recNum < lnau.summary.data.length; recNum++) {
			if (_groups.length == 0 || _groups.indexOf(lnau.summary.data[recNum].group_name) < 0 ) {
				_groups.push (lnau.summary.data[recNum].group_name);
				var cell = row.insertCell(_groups.length);
				cell.innerHTML = lnau.summary.data[recNum].group_name;
			}
		}
		for (var recNum = 0; recNum < lnau.summary.data.length; recNum++) {
			if (_disciplines.length == 0 || _disciplines.indexOf(lnau.summary.data[recNum].discipline) < 0) {
				_disciplines.push (lnau.summary.data[recNum].discipline);
				var row = $table.insertRow(_disciplines.length);
				var cell = row.insertCell(0);
				cell.innerHTML = lnau.summary.getFieldValue (recNum, 'discipline');
			}
		}
		//for (var discNum = 0; discNum < _disciplines.length; discNum++) {
			
		//}
	},
	// =====================================
	summary_callback_old: function ( responderId ) {
		
		if ( lnau.disciplines.data.length == 0 || lnau.groups.data.length == 0 ) {
			console.info ('Wait for another database');
			return;
		}
		var semestr = prompt ('Семестр: ', 2);
		if (!semestr*1 || !(semestr*1 == 1 || semestr*1 == 2)) {
			alert("Неправильно вказаний семестр: " + semestr);
			return false;
		}
		var states = ['6.', '8.', '7.'];
		var $table = document.createElement('table');
		$table.appendChild(document.createElement('caption'));
		$table.caption.innerHTML = "Семестр: " + semestr;
		$table.caption.className = "green";
		$table.cellspacing = '0';
		$table.cellpadding = '10';
		
		document.getElementById("main_content").innerHTML = '';
		document.getElementById("main_content").appendChild($table);
		
		var row = $table.insertRow(0);
		row.style.position = 'fixed';
		row.style.top = '70px';
		// row.style.left = '250px';
		row.style.backgroundColor = 'black';
		row.style.color = 'white';
		var cell = row.insertCell(0);
		cell.style.width = '250px';
		for (var cellNum = 0; cellNum < lnau.groups.data.length; cellNum++) {
			
			var cell = row.insertCell(cellNum + 1);
			cell.style.color = "#960064";
			cell.style.width = '120px';
			cell.innerHTML = lnau.groups.data[cellNum].group_name;
			cell.style.border = '1px solid #555';
		}
		
		for ( var rowNum = 0; rowNum < lnau.disciplines.data.length; rowNum++ ) {
			var row = $table.insertRow(rowNum + 1);
			var cell = row.insertCell(0);
			cell.style.width = '250px';
			var _discipline = lnau.disciplines.data[rowNum];
			cell.innerHTML = lnau.disciplines.getFieldValue (rowNum, 'code');
			for ( var sellNum = 0; sellNum < lnau.groups.data.length; sellNum++ ) {
				var cell = row.insertCell(sellNum + 1);
				cell.style.width = '120px';
				var _group = lnau.groups.data[sellNum];
				var _speciality = states[_group.state] + _group.speciality;
				var tst = (_group.semestr == semestr && _group.form_of_study == _discipline.form_of_study);
				tst = tst && (_group.duration == _discipline.duration);
				tst = tst && (_group.course == _discipline.course);
				tst = tst && (_speciality == _discipline.speciality_1 || _speciality == _discipline.speciality_2);
				if ( tst ) {
					cell.innerHTML = _discipline.hours_audirorial * ((_group.students < 7)?(0.1):(1));
				}
			}
		}
	}
}
