<!DOCTYPE html>
<html lang="en">
   <head>
	  <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	  <meta http-equiv="Access-Control-Allow-Origin" content="*">
    
       <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
      <title>EYE-SITE</title>
         <link rel="stylesheet" type="text/css" href="styleNiEyesite.css">
   </head>
   <body>
   

 	
 	 
<br>
    <div class="col-md-2 col-sm-3 col-xs-6" style="margin-left: 20px;" > <a href="newHomepage.php" class="btn btn-sm animated-button victoria-two"><img src="home.png" height="150"><br>HOME</a></div>
    <div>
    <div class="col-md-5 col-sm-3 col-xs-6" style="margin-left: 270px; margin-top: 180px" > <a href="eyesite.php?action=Forward" class="btn btn-sm animated-button victoria-two"  style="height:300px"><img src="arrowup.png" height="250"><br>FORWARD</a> </div>
    <br>
	 <div class="col-md-4 col-sm-3 col-xs-6" style="margin-left: 50px;" > <a href="eyesite.php?action=Left" class="btn btn-sm animated-button victoria-two"  style="height:300px"><img src="arrowleft.png" height="250"><br>LEFT</a> </div>

    <div class="col-md-3 col-sm-3 col-xs-6" style="margin-left: 45px;" > <a href="eyesite.php?action=Stop" class="btn btn-sm animated-button victoria-three"  ><img src="stop.png" height="250"><br>STOP</a> </div>
	 	 <div class="col-md-4 col-sm-3 col-xs-6" style="margin-left: 30px;"> 
	 	 	<a href="eyesite.php?action=Right" class="btn btn-sm animated-button victoria-two"  style="height:300px"><img src="arrowright.png" height="250"><br>RIGHT</a> </div>
    <div class="separator"></div>
    <div class="col-md-5 col-sm-3 col-xs-6" style="margin-left: 650px;" > <a href="eyesite.php?action=Backward" class="btn btn-sm animated-button victoria-four"  style="height:300px"><img src="arrowdown.png" height="250"><br>BACKWARD</a> </div>

		<br><br>
	 </div>
	</div>
	
<?php

if(isset($_GET['action']))
{
	 
	if($_GET['action']=="Forward")
	{
		$fp =fopen("COM8", "w");
  fwrite($fp, 1); /* this is the number that it will write */
  fclose($fp);
		echo "Forward";
	}
		else if($_GET['action']=="Backward")
	{
		$fp =fopen("COM8", "w");
  fwrite($fp, 2); /* this is the number that it will write */
  fclose($fp);
	}
	else if($_GET['action']=="Right")
	{
		$fp =fopen("COM8", "w");
  fwrite($fp, 3); /* this is the number that it will write */
  fclose($fp);
	}
	else if($_GET['action']=="Left")
	{
		$fp =fopen("COM8", "w");
  fwrite($fp, 4); /* this is the number that it will write */
  fclose($fp);
	}
	else if($_GET['action']=="Stop")
	{
		$fp =fopen("COM8", "w");
  fwrite($fp, 0); /* this is the number that it will write */
  fclose($fp);
	}

}
?>

    </body>
    
	
</html>