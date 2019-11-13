<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Talk Keyboard</title>

</script>  
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
        body{
             background: var(--color-page-bg);
        }
        #search_field{

            display: block;
            margin-top: 100px;
            margin-left: 200px;
            padding: 5px 10px;
            font-size: 200px; 
            width: 80%;

        }
            .jkeyboard {
  display: inline-block; 
}
.jkeyboard, .jkeyboard .jline, .jkeyboard .jline ul {
  display: block;
  margin: 0;
  padding: 0;



}
.jkeyboard .jline {
  text-align: center;
  margin-left: -14px;



}
.jkeyboard .jline ul li {
  font-family: arial, sans-serif;
  font-size: 30px;
  display: inline-block;
  border: 1px solid  #185a82;
  -webkit-box-shadow: 0 0 3px #185a82;
  -webkit-box-shadow: inset 0 0 3px #185a82;
  margin: 40px 0 10px 28px;
  color: #185a82
  border-radius: 5px;
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  text-align: center;
  line-height: 52px;
  overflow: hidden;
  cursor: pointer;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: -moz-none;
  -ms-user-select: none;
  user-select: none;
}
.jkeyboard .jline ul li.uppercase {
  text-transform: uppercase;
}
.jkeyboard .jline ul li:hover, .jkeyboard .jline ul li:active {
  background-color: #185a82;
}
.jkeyboard .jline .return {
  width: 120px;
}
.jkeyboard .jline .space {
  width: 456px;
}
.jkeyboard .jline .numeric_switch {
  width: 84px;
}
.jkeyboard .jline .layout_switch {
  background: url("../lib/assets/locale.png") no-repeat center right;
}
.jkeyboard .jline .shift {
  width: 100px;
  background: url("../lib/assets/shift.png") no-repeat center center;
}
.jkeyboard .jline .backspace {
  width: 200px;
  background: url("../lib/assets/backspace.png") no-repeat center center;
}
#speakme
{
  margin-left: 1700px;
  margin-top: -670px;
}
#speakme2
{
 margin-top: -30px;
}
    </style>
</head>
<body>

    <input type="text" id="search_field" name="text">
    <div id="keyboard"></div>
    

    <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
    <script src="../lib/js/jkeyboard.js"></script>
    <script>
        $('#keyboard').jkeyboard({
            layout: "english_capital",
            input: $('#search_field'),
            customLayouts: {
                selectable: ["english_capital"],
                english_capital: [
                    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',],
                    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '\'', '.'],
                    ['space', '-', 'backspace','shift']
                    ],
            }
        });
    </script>
    <div id="speakme2">
     <a href="/eyesite/newHomepage.php"><button id="home"><img src="../home.png" height="200" width="250"><br><font size="50">Home</font></button></a>
   </div>
<div id="speakme">
    <button id="speak"><img src="../speak.png" height="200" width="250"><br><font size="50">Speak</font></button>
</div>
     <script type=text/javascript> 

     var speechRs = speechRs || {};
    speechRs.speechinit = function(lang,cb,bcolor,color,pitch,rate){
   this.speaker = new SpeechSynthesisUtterance();
   this.speaker.pitch=pitch || 1;
   this.speaker.rate=rate || 1;  
   this.lan = lang;
   var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.rsClass{background-color:'+(bcolor || "#4f91e6")+';color:'+(color || "#fff")+';}';
    document.getElementsByTagName('head')[0].appendChild(style);
   setTimeout(function(){
   speechRs.speaker.voice = speechSynthesis.getVoices().
     filter(function(voice) {  return voice.name == speechRs.lan; })[0];
   },500);
   if(lang == 'native'){
    cb(this);
   }else{
     setTimeout(function(){
     cb(speechRs)
     },1000);
   }
  }
  
speechRs.speak = function(text,cb,isHiligh) {
     let j=0,el,ar=[];
     speechRs.speaker.voice = speechSynthesis.getVoices().
     filter(function(voice) {  return voice.name == speechRs.lan; })[0];
     this.speaker.onend = function(e) {
        cb(e);
    };
    if (typeof text == 'string') {
      this.speaker.text = text;
      speechSynthesis.speak(this.speaker);
   } else {
       if(isHiligh){
            j = 0;
            el = text;
            ar = (text.innerHTML).split(".");
            readop(ar[j]);      
        }else{
          this.speaker.text = text.innerHTML;
        speechSynthesis.speak(this.speaker);
        }     
   }
    
    function readop(x){
      speechRs.speaker.text = x;
      if(j != 0){
      el.querySelector(".rsClass").className = "";
      }
      el.innerHTML = (el.innerHTML).replace(ar[j],"<span class='rsClass'>"+ar[j]+"</span>");
      speechSynthesis.speak(speechRs.speaker);
      speechRs.speaker.onend = function(e){
         if(ar.length>(j+1)){
          readop(ar[++j]);
          }
      }
    }
  }
  
speechRs.rec_start = function(l,callback){
    
     this.recognition = new webkitSpeechRecognition();
     this.recognition.continuous = true;
     this.recognition.interimResults = true;
         this.arry_com = {};
     this.final_transcript = '';
         this.recognition.lang = l;
     this.recognition.start();
     this.ignore_onend = false;
     this.recognition.onstart = function(c) {   
        
         }
    let prev_res='';
    this.recognition.onresult = function(event) {
             let interim_transcript = '';            
                if (typeof(event.results) == 'undefined') {
                  speechRs.recognition.onend = null;
                  speechRs.recognition.stop();
                  return;
                }
                
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                   prev_res='';
                       speechRs.final_transcript += event.results[i][0].transcript;
                       } else {
                      interim_transcript += event.results[i][0].transcript;
                      
                                 }
                 }
              console.log(prev_res+","+interim_transcript);
              if(prev_res != interim_transcript && speechRs.arry_com[interim_transcript.toLowerCase().trim()]){               
                   prev_res = interim_transcript;     
                               speechRs.arry_com[interim_transcript.toLowerCase().trim()]();
                                  
              }else{
              } 

                callback(speechRs.final_transcript.replace("undefined",""),interim_transcript); 
                          
               }    
}
    
speechRs.on = function(s,f){
    this.arry_com[s.toLowerCase()] = f;
} 

speechRs.rec_stop = function(callback){
  this.recognition.stop();
  this.recognition.onstop = function() {
     return callback(); 
  }    
}
 
document.getElementById("speak").onclick = function()
{
    speechRs.speechinit('Google UK English Female',function(e)
    {
        var text = $('input[name="text"]').val();
        text = encodeURIComponent(text);
        console.log(text);

        speechRs.speak(text,function() {},false);
    });
}  
</script>
</body>
</html>