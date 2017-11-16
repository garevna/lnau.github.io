<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>php read file</title>
</head>

<body>
<?php
    //$fp = fopen("disciplines.json", "r");
	//if ($fp) {
		//while (!feof($fp)) {
		//	$mytext = fgets($fp, 999);
		//	echo $mytext."<br />";
		//}
	//}
	//else echo "Ошибка при открытии файла";
	//fclose($fp);
	$mytext = file_get_contents("disciplines.json");
	$myArr = json_encode($mytext);
	echo $myArr[0];

?>
<script>
    var myJSON = <?php echo $mytext ?>;
	console.log(myJSON);
	console.info(myJSON[150].discipline);
	myJSON[150].discipline = "Производственная практика";
	
</script>
<?php
    $filename = 'disciplines.json';

    $handle = fopen($filename, 'r+');
    ftruncate($handle, 0);
    rewind($handle);
    fclose($handle);
	file_put_contents ( $filename , $mytext );
?>
</body>
</html>
