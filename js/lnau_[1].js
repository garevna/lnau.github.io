var lnau = {};

lnau.crossDatabaseProcessor = {
	    requestTo: {
		    disciplines:     { status:false, sourse:null, callback:null, params:null },
		    groups:          { status:false, sourse:null, callback:null, params:null },
		    auditories:      { status:false, sourse:null, callback:null, params:null },
		    directions:      { status:false, sourse:null, callback:null, params:null },
		    specialities:    { status:false, sourse:null, callback:null, params:null },
		    disciplinesList: { status:false, sourse:null, callback:null, params:null },
		    teachers:        { status:false, sourse:null, callback:null, params:null }
		},
		answerFrom:{
			disciplines:     { status:false, target:null, data:null, params:null },
		    groups:          { status:false, target:null, data:null, params:null },
		    auditories:      { status:false, target:null, data:null, params:null },
		    directions:      { status:false, target:null, data:null, params:null },
		    specialities:    { status:false, target:null, data:null, params:null },
		    disciplinesList: { status:false, target:null, data:null, params:null },
		    teachers:        { status:false, target:null, data:null, params:null }
		},
		sendRequest: function (requesterId, responderId, params) {
			this.requestTo[responderId].sourse = requesterId;
			this.requestTo[responderId].callback = params.callback;
			this.requestTo[responderId].params = params.callback_params || null;
			var _worker = lnau[responderId].worker;
			var $params = params.fields?(params.values?{keyFields:params.fields,keyValues:params.values}:{fields:params.fields}):null;
			_worker.postMessage( { request_type:1, params: $params });
			
			this.requestTo[responderId].status = true;
		},
		// ================================================================================== answerIsReady
		answerIsReady: function (responderId, $data) {
			
			this.answerFrom[responderId].target = this.requestTo[responderId].sourse;
			this.requestTo[responderId].sourse = null;
			// сброс статуса запроса
			this.requestTo[responderId].status = false;
			this.answerFrom[responderId].data = $data;
			this.answerFrom[responderId].status = true;
			var _callback = this.requestTo[responderId].callback;
			var _params = this.requestTo[responderId].params;
			_callback (responderId, _params);
		},
		getAnswer: function (responderId) {
			this.answerFrom[responderId].status = false;
			return this.answerFrom[responderId].data;
		}
};
// =========================================++++========================================================== SECTION
lnau.section = {
		names: [ 'discipline', 'group', 'direction', 'speciality', 'auditory', 'disciplinesList', 'teachers' ],
		titles: {
			discipline: 'Дисципліни',
			group: 'Групи',
			direction: 'Напрями',
			speciality: 'Спеціальності',
			auditory: 'Аудиторії',
			disciplinesList:"Справочник дисциплин",
			teachers: "Викладачі"
		},
		is_active: {
			discipline: false,
			group: false,
			direction: false,
			speciality: false,
			auditory: false,
			change: function (selected) {
				lnau.section.is_active.discipline = false;
				lnau.section.is_active.group = false;
				lnau.section.is_active.direction = false;
				lnau.section.is_active.speciality = false;
				lnau.section.is_active.auditory = false;
				lnau.section.is_active.teachers = false;
				lnau.section.is_active[selected] = true;
				document.getElementById('main_content').innerHTML = '';
				document.getElementById("lnau_section_menu").style.display = 'inline-block';
				document.getElementById("lnau_section_menu").value = null;
				
				// --------------------------------------  button "Показать дисциплины"
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				var tst = (selected == 'disciplinesList' || selected == 'group' || selected == 'auditory');
				var _tst = (selected == 'discipline');
				var $tst = (selected == 'teachers');
				
				document.getElementById("lnau_disciplinesList").style.display = (_tst)?"inline-block":"none";
				document.getElementById("lnau_sel").style.display = (tst || _tst || $tst)?'inline-block':'none';
				document.getElementById("lnau_edit").style.display = (tst || _tst || $tst)?'inline-block':'none';
				document.getElementById("lnau_full_list").style.display = (tst || _tst || $tst)?'inline-block':'none';
				
				//  Кнопки создания списка дисциплин
				document.getElementById("lnau_buildDisciplinesList").disabled = true;
				document.getElementById("lnau_saveDisciplinesList").disabled = true;
				
				if (!(tst || _tst)) {
					lnau.section.obj.keyFields=[];
					lnau.section.obj.keyValues=[];
					lnau.section.obj.sendRequestForAllData();
				}
				if (selected == 'auditory') {
					document.getElementById("lnau_tableForm").disabled = true;
					document.getElementById("lnau_tableForm").checked = false;
				}
				else {
					document.getElementById("lnau_tableForm").disabled = false;
					document.getElementById("lnau_tableForm").checked = true;
				}
			}
		},
		start_func: {
			discipline:function () {
				lnau.section.obj = lnau.disciplines;
				lnau.section.is_active.change('discipline');
			},
			group:function () {
				lnau.section.obj = lnau.groups;
				lnau.section.is_active.change('group');
			},
			direction:function () {
				lnau.section.obj = lnau.directions;
				lnau.section.is_active.change('direction');
			},
			speciality:function () {
				lnau.section.obj = lnau.specialities;
				lnau.section.is_active.change('speciality');
			},
			auditory:function () {
				lnau.section.obj = lnau.auditories;
				lnau.section.is_active.change('auditory');
			},
			disciplinesList:function () {
				lnau.section.obj = lnau.disciplinesList;
				lnau.section.is_active.change('disciplinesList');
			},
			teachers:function () {
				lnau.section.obj = lnau.teachers;
				lnau.section.is_active.change('teachers');
			}
		},
		methods:{
			selectData:function () {
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				lnau.section.obj.sendRequestForRecodsByKeys();
			},
			fullList:function () {
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				lnau.section.obj.keyFields=[];
				lnau.section.obj.keyValues=[];
				lnau.section.obj.sendRequestForAllData();
			},
			edit:function () {
				if (lnau.section.is_active.group) {
					document.getElementById("lnau_showDisciplines").style.display = 'inline-block';
				}
				lnau.section.obj.getSelectedRecords();
			},
			remove:function () {
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				lnau.section.obj.removeSelectedRecords();
			},
			append:function () {
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				lnau.section.obj.appendNewRecord();
			},
			save:function () {
				lnau.section.obj.sendRequestToSaveData();
			}
		}
};
// ==================================================================== CURRENT DATA  |  SEMESTR
lnau.currentData = new Date();
	lnau.currentData = {
		day:lnau.currentData.getDate(),
		month:lnau.currentData.getMonth()+1,
		year: lnau.currentData.getFullYear()
	};
lnau.current_semestr = (lnau.currentData.month > 5)?1:2;