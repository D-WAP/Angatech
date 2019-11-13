<!DOCTYPE html>
<html lang="en">
   <head>

	  <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	  <meta http-equiv="Access-Control-Allow-Origin" content="*">
    <body>
    <?php 
    $port = fopen("COM8", "w+");
    sleep(2);
    ?> 
  <form action="eyesite2.php" method="POST">
<br>
		<input type="hidden" name="fwd" value="diretso" />
     <input type="Submit" value="diretso" style="height:300px">
</form>
	

	<?php 

	if(isset($_POST['fwd']) == "diretso")
	{
		echo "galaw";
		fwrite($port, '1');
	}

	if(isset($_POST['lft'])=="kaliwa")
	{
				fwrite($port, "3");
	}

	if(isset($_POST['rght'])=="kanan")
	{
				fwrite($port, "4");
	}

	if(isset($_POST['stp'])=="hinto")
	{
		fwrite($port, "0");
	}

	if(isset($_POST['bwd'])=="balik")
	{
		fwrite($port, "2");
	}

	?>
    </body>
    
	
</html>
