// LNAU library

var lnau_lib = {};

lnau_lib.classes = {
	roundedButton: "lnau_roundedButton",
	popupWindow: "lnau_popupWindow",
	popupWindowContent: "lnau_popupWinContent",
};
lnau_lib.ids = {
	helpWin: "lnau_helpWin"
}
// =======================================================================================================================

lnau_lib.createButton = function(type, num) {
		var btn = document.createElement('div');
		btn.className = lnau_lib.classesroundedButton;
		btn.innerHTML = lnau.$buttonsTypes[type].symb;
		btn.style.backgroundColor = lnau.$buttonsTypes[type].backColor;
		if (lnau.$buttonsTypes[type].float) {
			btn.style.float = lnau.$buttonsTypes[type].float;
		}
		if (lnau.$buttonsTypes[type].type == 'close') {
			btn.style.position = 'absolute';
			btn.style.top = lnau.$buttonsTypes[type].top;
			btn.style.right = lnau.$buttonsTypes[type].right;
		}
		else {
			btn.num = num;
		}
		btn.onclick = function(event) {
			var func = lnau.$buttonsTypes[type].func;
			func(event); //  type should be 0 (close button) or 1 (help button)
		};
		return btn;
};
// =======================================================================================================================
lnau_lib.constructPopupWindow = function(winCaption) {
	var selectionWindow = document.createElement('div');
	selectionWindow.className = lnau_lib.classes.popupWindow;
	selectionWindow.style.top = '12%';
	selectionWindow.style.left = '10%';
	selectionWindow.style.height = '70%';
	selectionWindow.style.width = '75%';
	selectionWindow.style.backgroundColor = "#000";
	selectionWindow.content = document.createElement('div');
	selectionWindow.appendChild(selectionWindow.content);
	selectionWindow.content.className = lnau_lib.classes.popupWindowContent;
	
	var selectionWindowHeader = document.createElement('h2');
	selectionWindowHeader.innerHTML = winCaption || '';
	return selectionWindow;
};
// =======================================================================================================================
lnau_lib.taskHelp = function(num) {
		var $hlp = document.getElementById(lnau_lib.ids.helpWin);
		if (!$hlp) {
			$hlp = document.createElement('div');
			document.body.appendChild($hlp);
			$hlp._width = '58%';
			$hlp._top = '25%';
			$hlp._left = '20%';
			$hlp._height = '50%';
			$hlp.backColor = 'black';
			lnau.constructPopupWindow($hlp);
			$hlp.id = lnau_lib.ids.helpWin;
		}
		$hlp.content.innerHTML = "<p>" + lnau.html[num].hlp + "</p>";
		$hlp.style.display = "block";
};
// ======================================================================================= testArrayForRepeatedValues
lnau_lib.testArrayForRepeatedValues = function (_array, fields) {
	fields = Array.isArray(fields)?fields:[fields];
	var arrayFields = Object.keys(_array[0]);
	var tmp = [];
	for (var recordNum = 0; recordNum < _array.length; recordNum++) {
		var record = {};
		for (var fieldNum = 0; fieldNum < fields.length; fieldNum++) {
			var k = arrayFields.indexOf(fields[fieldNum]);
			if ( k >= 0 ) {
				record[fields[fieldNum]] = _array[recordNum][arrayFields[k]];
			}
			else { record[fields[fieldNum]] = ''; }
		}
		tmp = tmp.concat(record);
	}
	var tmp = tmp.sort ( function(a, b) {
		var fields = Object.keys(a);
		var _a = '';
		var _b = '';
		for (var j = 0; j < fields.length; j++) {
			_a = _a + a[fields[j]];
			_b = _b + b[fields[j]];
		}
		if ( _a < _b ) { return -1; }
		if ( _a > _b ) { return  1; }
		return 0;
	} );
	var newArray = [];
	while ( tmp.length > 0 ) {
		var z = tmp.shift();
		newArray = newArray.concat(z);
		if (tmp.length > 0 ) {
			var cond = 'true';
			for (var j = 0; j < fields.length; j++) {
				var field = fields[j];
				cond = cond + ' && (z["' + field + '"] == tmp[0]["' + field + '"])';
			}
			while ( tmp.length > 0 && eval(cond) ) { tmp.shift(); }
		}
	}
	return newArray;
}
// ==================================================================================== 
lnau_lib.create_selection_field = function ( params ) {
		
		// params: {
		//     input_element,              Связанный элемент (input) для ввода значений в поле record_sql_field
		// 	   record,                     Запись из БД (объект)
		// 	   record_sql_field,           Название поля записи для фильтрации значений из библиотеки
		// 	   record_data_field,          Название поля записи с шифром записи из библиотеки
		// 	   library,                    Библиотека (объект)
		//     lib_sql_field,              Название поля записи библиотеки для фильтрации значений
		//     lib_data_field              Название поля записи библиотеки с данными для вывода 
		// }
		//    
		//    library[record[record_data_field]] - нужный элемент из библиотеки
		//
		var txt1 = 'Обязательный параметр функции create_selection_field:  params.';
		if (!params.record) { console.error(txt1 + 'record отсутствует'); return false; }
		if (!params.record_sql_field) { console.error(txt1 + 'record_sql_field отсутствует'); return false; }
		if (!params.record_data_field) { console.error(txt1 + 'record_data_field отсутствует'); return false; }
		if (!params.library) { console.error(txt1 + 'library отсутствует'); return false; }
		if (!params.lib_sql_field) { console.error(txt1 + 'lib_sql_field отсутствует'); return false; }
		if (!params.lib_data_field) { console.error(txt1 + 'lib_data_field отсутствует'); return false; }
		
		var ret = document.createElement('div');
		
		// Поле, значение которого меняется из списка
			
		var _span = document.createElement('span');
		ret.appendChild(_span);
		var code = params.record[params.record_data_field];
		if ( code && params.library[code] ) {
			_span.innerHTML = params.library[code][params.lib_data_field];
			_span.style.color = '#055';
			_span.style.fontWeight = 'bold';
		}
		else {
			_span.innerHTML = 'Значення не визначене';
			_span.style.color = '#f00';
		}
			
		// Динамически формируемый список (при получении фокуса)
		var _select = document.createElement('select');
			_select.style.margin = '0 10px';
			_select.className = 'ref_list';
			_select._span = _span;                       //  Где выводится значение из библиотеки
			
			_select.record = params.record;
			_select.record_sql_field = params.record_sql_field;
			
			_select.field = params.record_data_field;
			_select.input_element = params.input_element;
			
			_select.library = params.library;
			_select.sql = params.lib_sql_field;
			_select.data = params.lib_data_field;
		
		_select.onfocus = function (event) {
			
			var _select = event.target;
			var keys = Object.keys(_select.library);
			
			_select._span.style.display = 'none';
			var _option = document.createElement('option');
			_option.value = null;
			_option.innerHTML = '...';
			_select.appendChild(_option);
			var test_sql = _select.record[params.record_sql_field];
			for (var i = 0; i < keys.length; i++) {
				var _code = keys[i];
				var sql = _select.library[_code][_select.sql];
				var data = _select.library[_code][_select.data];
				
				if ( sql == test_sql || !test_sql) {
					var _option = document.createElement('option');
					_option.value = _code;
					_option.innerHTML = data;
					this.appendChild(_option);
				}
			}
			this.focus();
		}
		ret.appendChild(_select);
			
		_select.onchange = function (event) {
				var _select = event.target;
				if (!_select.value) { alert('Not changed'); return; }
				_select._span.innerHTML = _select.options[_select.selectedIndex].text;
				_select._span.style.color = "#055";
				_select._span.style.fontWeight = "bold";
				_select.record[_select.field] = _select.options[_select.selectedIndex].value;
				var code = _select.options[_select.selectedIndex].value;
				_select.record[params.record_sql_field] = _select.library[code][_select.sql];
				if (_select.input_element) {
					_select.input_element.value = _select.library[code][_select.sql];
					_select.blur();
				}
			_select._span.style.display = 'inline';
			_select.blur();
		}
		_select.onblur = function (event) {
			var _select = event.target;
			_select._span.style.display = 'inline';
			this.innerHTML = '';
		}
		return ret;
}
// ======================================================================================================================