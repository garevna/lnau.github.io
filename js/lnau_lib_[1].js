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
	console.log(newArray);
	return newArray;
}
// ======================================================================================================================