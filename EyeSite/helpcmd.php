<!DOCTYPE html>
<html>
<head>
	<title>
	</title>
</head>
<style>
:root{
  --button-height: 3rem;
  --color-text: rgba(0,0,0,.25);
  --color-text-shadow: rgba(255,255,255,.15);
  --color-page-bg:#B9B5AA;
  --color-bg:#899095;
  --color-bg-light:#969DA3;
  --color-bg-dark: #7D878F;
  --color-overlay-light: rgba(255,255,255,.2);
  --color-overlay-medium: rgba(0,0,0,.1);
  --color-overlay-dark: rgba(0,0,0,.2);
  --color-tab-focus: rgba(255,255,255,.15);
}

.red-button{
  --color-bg:#E44E55;
  --color-bg-light:#E47479;
  --color-bg-dark:#D13239;
 
}

.green-button{
  --color-bg:#00A07D;
  --color-bg-light:#00AF8A;
  --color-bg-dark:#008F70;
}

.blue-button{
  --color-bg:#0066B4;
  --color-bg-light:#3981CA;
  --color-bg-dark:#004EAD;
}

.yellow-button{
  --color-bg:#FFC054;
  --color-bg-light:#FFD996;
  --color-bg-dark:#F2AA30;
  
}

.retro-button{
  position:relative;
  appearance:none;
  box-sizing:border-box;
  font-size:calc( var(--button-height) / 3 );
  font-family: 'Open Sans', sans-serif;
  background: var(--color-bg);
  height:350px;
  min-width:var(--button-height);
  border-radius:calc( var(--button-height) / 2);
  border:0;
  font-weight:800;
  text-transform:uppercase;
  color:var(--color-text);
  text-shadow: 1px 1px var(black);
  cursor:pointer;
  margin:6px 6px;
  letter-spacing:.1em;
  transition: all 200ms ease;
  box-shadow:
    -1px  -1px 1px var(--color-bg), //top highlight
    0 0 0 4px var(--color-overlay-medium), //outer shadow
    1px  1px 1px var(--color-bg-dark), //bottom lowlight
    inset .0 .0 .0 var(--color-overlay-dark), //inset shadow    
    inset .5rem .5rem .25rem var(--color-bg-light) //button gloss
}

.retro-button::-moz-focus-inner{
  outline:none;
  border:none;
}

.retro-button:focus{
  outline:none;
  box-shadow:
    -1px -1px 1px var(--color-bg-dark), //top highlight
    0 0 0 4px var(--color-tab-focus), //outer shadow
    1px  1px 1px var(--color-bg-dark), //bottom lowlight
    inset 0 0 0 var(--color-overlay-dark), //inset shadow
    inset .5rem .5rem .25rem var(--color-bg-light), //button gloss
    ;
}

.retro-button:hover{
  box-shadow:
    -1px -1px 1px var(--color-bg-dark), //top highlight
    0 0 0 4px var(--color-overlay-dark), //outer shadow
    1px  1px 1px var(--color-bg-dark), //bottom lowlight
    inset 0 0 0 var(--color-overlay-dark), //inset shadow
    inset .5rem .5rem .25rem var(--color-bg-light), //button gloss
    ;
}

.retro-button:active{
  box-shadow:
    inset 1px 1px 1px var(--color-bg), //top highlight   
    0 0 0 4px var(--color-overlay-dark), //outer shadow
    inset -1px -1px 1px var(--color-bg-light), //bottom lowlight    
    inset .5rem .5rem .75rem var(--color-bg-dark), //inset shadow
    inset .5rem .5rem .5rem var(--color-bg-light), //button gloss
}


body{
  background: var(--color-page-bg);
  display:flex;
  justify-content:center;
  height:100vh;
  border:1px solid var(--color-page-bg);
  box-sizing:border-box;
  overflow:hidden;
  box-shadow:
    inset 20vw 20vw 30vw rgba(255,255,255,.05),
    inset -20vw -20vw 30vw rgba(0,0,0,.1);
  padding:1rem;
}

.presentation-content{
  text-align:center;
}

.igilidmo{
	margin-right: -200px;
}
.presentation-title{
  color:rgba(0,0,0,.2);
  text-shadow: 1px 1px rgba(255,255,255,.15);  
  font-family: 'Open Sans', sans-serif;
  font-weight:800;
  text-transform:uppercase;
  margin-bottom:1rem;
  font-size:1.5rem;
}

.top-button-group{
  display:flex;
  padding-bottom:1rem;

  & > * {
    flex:1;
  }
}

.footer
{
	margin-top: 220px;
	font-size: 30px;
	text-align: right;
}

.bottom-button-group{
  background:var(--color-bg);

  padding:1rem;
  border-radius:1rem;
  box-shadow:
    -1px -1px 1px var(--color-bg-light),
    inset -1px -1px  1px var(--color-bg-dark)
}
</style>
<body>
<div class="igilidmo"><button><a href="newHomepage.php"><img src="home.png" height="150" width="200"><br>HOME</a></button></div>
<div class="presentation-content">
	
<img src="help.jpg" height="250" width="400">
<br><br>
  <div class="bottom-button-group">
  	<form action="sendme.php" method="POST">
    <button class="retro-button red-button" name="eatname"><img src="eat.png" height="250" width="400"><br>
	<font size="20dp">Eat</button><button class="retro-button yellow-button" name="sleepname">	<img src="sleep.png" height="250" width="400"><br>
	<font size="20dp">Sleep
</button><button class="retro-button blue-button" name="toiletname"><img src="toilet.png" height="250" width="350"><br>
<font size="20dp">Toilet
</button><button class="retro-button green-button" name="medicinename">	<img src="medicine.png" height="250" width="400"><br>
	<font size="20dp">Medicine
</button>
  </div>
  <br>
  <div class="bottom-button-group">
    <a href="Examples/TalkKeyboard.php"><button class="retro-button red-button"><img src="water.png" height="250" width="400"><br>
	<font size="20dp">Water</button></a><button class="retro-button yellow-button">	<img src="bath.png" height="250" width="400"><br>
	<font size="20dp">Bath
</button>

  </div>
  <div class ="footer">
  EyeCan © 2019 
  
</div>




	

</body>

</html>