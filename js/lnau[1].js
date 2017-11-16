var lnau = {};

lnau.crossDatabaseProcessor = {
	    requestTo: {
		    disciplines:     { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
		    groups:          { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
		    auditories:      { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
		    directions:      { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
		    specialities:    { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
		    disciplinesList: { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
			teachers:        { status:false, sourse:null, callback:null, params:null, queue: null, index: null },
			summary:         { status:false, sourse:null, callback:null, params:null, queue: null, index: null }
		},
		answerFrom:{
			disciplines:     { status:false, target:null, data:null, params:null, queue: null, index: null },
		    groups:          { status:false, target:null, data:null, params:null, queue: null, index: null },
		    auditories:      { status:false, target:null, data:null, params:null, queue: null, index: null },
		    directions:      { status:false, target:null, data:null, params:null, queue: null, index: null },
		    specialities:    { status:false, target:null, data:null, params:null, queue: null, index: null },
		    disciplinesList: { status:false, target:null, data:null, params:null, queue: null, index: null },
			teachers:        { status:false, target:null, data:null, params:null, queue: null, index: null },
			summary:         { status:false, target:null, data:null, params:null, queue: null, index: null }
		},
		createRequestQueue: function (requesterId, responderId, requestParams, requestQueue) {
			
			this.requestTo[responderId].index = -1;
			this.answerFrom[responderId].index = -1;
			
			this.requestTo[responderId].params = requestParams;
			this.requestTo[responderId].queue = [];
			for (var j = 0; j < requestQueue.length; j++) {
				this.requestTo[responderId].queue[j] = requestQueue[j].values;
			}
			var _params = {
				fields: requestParams.fields,
				values: this.requestTo[responderId].queue[0],
				callback: requestParams.callback
			}
			this.sendRequest (requesterId, responderId, _params);
		},
		sendRequest: function (requesterId, responderId, params) {
			// Посылаем запрос на данные в базу данных с идентификатором responderId
			this.requestTo[responderId].status = true;
			this.requestTo[responderId].index++;
			this.requestTo[responderId].sourse = requesterId;
			this.requestTo[responderId].callback = params.callback;
			this.requestTo[responderId].params = params.callback_params || this.requestTo[responderId].params;
			var _worker = lnau[responderId].worker;
			var $params = params.fields?(params.values?{keyFields:params.fields,keyValues:params.values}:{fields:params.fields}):null;
			_worker.postMessage( { request_type:1, params: $params });
		},
		// ================================================================================== answerIsReady
		answerIsReady: function (responderId, $data) {
			
			// установка статуса готовности ответа
			this.answerFrom[responderId].status = true;
			this.answerFrom[responderId].index++;
			
			this.answerFrom[responderId].target = this.requestTo[responderId].sourse;
			this.answerFrom[responderId].params = this.requestTo[responderId].params;
			
			this.answerFrom[responderId].data = $data;
			
			var _callback = this.requestTo[responderId].callback;
			
			var _params = this.requestTo[responderId].params;
			// Вызов обработчика запрашивающей БД
			// обработчик вызовет функцию getAnswer для получения запрошенных данных
			_callback (responderId, _params);
			// Проверяем наличие очереди запросов
			if ( this.requestTo[responderId].queue ) {
				if ( this.requestTo[responderId].index < this.requestTo[responderId].queue.length-1 ) {
					this.requestTo[responderId].index++;
					var values = this.requestTo[responderId].queue[this.requestTo[responderId].index];
					this.requestTo[responderId].params.values = values;
					requesterId = this.answerFrom[responderId].target;
					this.sendRequest (requesterId, responderId, this.requestTo[responderId].params);
				}
				else {
					this.requestTo[responderId].status = false;
					this.requestTo[responderId].sourse = null;
					this.requestTo[responderId].queue = null;
				}
			}
			else {
				// сброс статуса запроса
				this.requestTo[responderId].status = false;
				this.requestTo[responderId].sourse = null;
			}
		},
		// ================================================================================== getAnswer
		getAnswer: function (responderId) {
			
			this.answerFrom[responderId].status = false;
			return this.answerFrom[responderId].data;
		}
};
// =========================================++++========================================================== SECTION
lnau.section = {
		names: [ 'discipline', 'group', 'direction', 'speciality', 'auditory', 'disciplinesList', 'teachers', 'summary' ],
		titles: {
			discipline: 'Дисципліни',
			group: 'Групи',
			direction: 'Напрями',
			speciality: 'Спеціальності',
			auditory: 'Аудиторії',
			disciplinesList: "Справочник дисциплин",
			teachers: "Викладачі",
			summary:"Зведена таблиця"
		},
		is_active: {
			discipline: false,
			group: false,
			direction: false,
			speciality: false,
			auditory: false,
			disciplinesList:false,
			teachers:false,
			summary:false,
			change: function (selected) {
				lnau.section.is_active.discipline = false;
				lnau.section.is_active.group = false;
				lnau.section.is_active.direction = false;
				lnau.section.is_active.speciality = false;
				lnau.section.is_active.auditory = false;
				lnau.section.is_active.teachers = false;
				lnau.section.is_active.summary = false;
				lnau.section.is_active[selected] = true;
				document.getElementById('main_content').innerHTML = '';
				document.getElementById("lnau_section_menu").style.display = 'inline-block';
				document.getElementById("lnau_section_menu").value = null;
				
				// --------------------------------------  button "Показать дисциплины"
				document.getElementById("lnau_showDisciplines").style.display = 'none';
				var tst = (selected == 'disciplinesList' || selected == 'group' || selected == 'auditory');
				var _tst = (selected == 'discipline');
				var $tst = (selected == 'teachers');
				var _summary = (selected == 'summary');
				
				var _disc = (selected == 'discipline');
				var _tchr = (selected == 'teachers');
				var _summ = (selected == 'summary');
				var _dlst = (selected == 'disciplinesList');
				var _grps = (selected == 'group');
				var _audt = (selected == 'auditory');
				
				var _fullList = (_disc || _tchr || _summ || _dlst || _grps || _audt);
				
				//document.getElementById("lnau_disciplinesList").style.display = (_disc)?"inline-block":"none";
				
				document.getElementById("lnau_sel").style.display = (_fullList)?'inline-block':'none';
				document.getElementById("lnau_edit").style.display = (_fullList)?'inline-block':'none';
				document.getElementById("lnau_full_list").style.display = (_fullList)?'inline-block':'none';
				
				//  Кнопки создания списка дисциплин
				//document.getElementById("lnau_buildDisciplinesList").disabled = true;
				//document.getElementById("lnau_saveDisciplinesList").disabled = true;
				
				if (!(tst || _tst)) {
					lnau.section.obj.keyFields=[];
					lnau.section.obj.keyValues=[];
					lnau.section.obj.sendRequestForAllData();
				}
				document.getElementById("lnau_summary").style.display = (_summary)?('inline-block'):('none');
				
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
			},
			summary:function () {
				lnau.section.obj = lnau.summary;
				lnau.section.is_active.change('summary');
				// lnau.funcs.create_summary_database ();
			},
		},
		methods:{
			summary: function () {
				lnau.funcs.create_summary_database ();
			},
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
			},
			indexing: function () {
				if (lnau.section.is_active.teachers) {
					lnau.teachers.indexingBD ('tabel_num');
				}
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