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
							console.info($data[listIndex][dataField] + ' = ' + lnau.disciplines.data[recNum][dataField]);
							lnau.disciplines.data[recNum][codeField] = $data[listIndex][codeField];
							console.info(lnau.disciplines.data[recNum][codeField]);
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
						$table.cellspacing = '2';
						$table.cellpadding = '5';
						
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
								// console.log(lnau.disciplines.common_data.code);
								
							}
						}
						document.getElementById("main_content").appendChild($table);
					},
					fields: ['course','form_of_study','duration','speciality_1','semestr'],
					values: [_record.course, _record.form_of_study, _record.duration, _speciality, semestr*1]
				};
				lnau.crossDatabaseProcessor.sendRequest('groups', 'disciplines', params);
			}
	}
}