var Twitter = require('twitter');
require('dotenv').config();

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

console.log(process.env.TWITTER_CONSUMER_SECRET);

var params = {screen_name: 'nodejs'};


/*
var FB = require('fb');

FB.setAccessToken('356948084997689|_x-4P6MgG5NdRLSVEkL55ZVCt78');

var body = 'My first post using facebook-node-sdk';
FB.api('356948084997689/feed', 'post', { message: body }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.id);
});
*/
var express = require('express');
var http = require('http');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

function getMealD(date, callback) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  var day = date.getDay() - 1;
  if(dd < 10) {
    dd = '0' + dd;
  }
  if(mm < 10) {
    mm = '0' + mm;
  }
  request('https://stu.goe.go.kr/sts_sci_md01_001.do?schulCode=J100005405&schulCrseScCode=3&schulKndScCode=03&schYmd='+yyyy+'.'+mm+'.'+dd, function(err, responce, body){
    var txt = body.replace(/\<br \/\>/gi, "\n");
    var $ = cheerio.load(txt);
    var i = 0;
    var meal = {};
    $('tr > .textC').slice(8, 13).each(function(){
      var title_info = $(this).text();
      meal[i] = title_info;
      i++;
      if(i == 5){
        console.log(meal[day]);
        callback(meal[day]);
      }
    });
  });
}

function getMealW(date, callback) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  var day = date.getDay() - 1;
  if(dd < 10) {
    dd = '0' + dd;
  }
  if(mm < 10) {
    mm = '0' + mm;
  }
  request('https://stu.goe.go.kr/sts_sci_md01_001.do?schulCode=J100005405&schulCrseScCode=3&schulKndScCode=03&schYmd='+yyyy+'.'+mm+'.'+dd, function(err, responce, body){
    var txt = body.replace(/\<br \/\>/gi, "\n");
    var $ = cheerio.load(txt);
    var i = 0;
    var meal = {};
    $('tr > .textC').slice(8, 13).each(function(){
      var title_info = $(this).text();
      meal[i] = title_info;
      i++;
      if(i == 5){
        console.log(meal[day]);
        callback(meal);
      }
    });
  });
}

function getPostT(today) {
  getMealD(today, function(result) {
    client.post('statuses/update', {status: '[오늘의 급식]\n'+today.getFullYear()+"년 "+(today.getMonth() + 1)+"월 "+today.getDate()+"일 \n"+result}, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
    });
  });
}

//메세지 요청을 받았을 때
app.get("/day", function(req, res) {
  var today = new Date("August 20, 2019 11:13:00");
  getMealD(today, function(result) {
    res.send(result);
  });
})

app.get("/week", function(req, res) {
  var today = new Date("August 20, 2019 11:13:00");
  getMealW(today, function(result) {
    res.send(result);
  });
});

app.post("/kakao", function(req, res) {
  var today = new Date("August 19, 2019 11:13:00");
  getMealW(today, function(result) {
    var ans = {
      "version": "2.0",
      "data": {
        "today":'[오늘의 급식]\n'+today.getFullYear()+"년 "+(today.getMonth() + 1)+"월 "+today.getDate()+"일 \n"+result[today.getDay() - 1],
        "next":'[내일의 급식]\n'+result[today.getDay()]
      }
    };
    res.json(ans);
    console.log(result);
  });
});


app.post("/message", function(req, res){
  var today = new Date("August 20, 2019 11:13:00");
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var day = new Date();
  day = day.getDay();
  var date = ["31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];
  if(day == 0){
    day = 7;
  }
  day = day;
  if(day == 7){
    dd--;
  }
//날짜계산
  if(!(req.body.content == "오늘 급식" && day < 6)){
    if((day > 5 && req.body.content != "이번 주 급식") || req.body.content == "다음 주 급식"){
      if(dd+7 > date[mm]){
        dd = 1;
        mm = mm + 1;
        if(mm > 12){
          mm = 1;
          yyyy++;
        }
      } else {
        dd = dd + 7;
        console.log("day"+dd);
      }
    }
  }
//이번주, 다음주 급식에 따른 날짜 계산
  dd = dd-0;
  day = day -0 ;

  console.log(mm+dd);
  if(dd < 10) {
    dd = '0' + dd;
  }
  if(mm < 10) {
    mm = '0' + mm;
  }
//나이스에 request
  var data = {};
  request('https://stu.goe.go.kr/sts_sci_md01_001.do?schulCode=J100005405&schulCrseScCode=3&schulKndScCode=03&schYmd='+yyyy+'.'+mm+'.'+dd, function(err, responce, body){
    console.log(body);
    var txt = body.replace(/\<br \/\>/gi, " ");
    console.log(txt);
    var $ = cheerio.load(txt);
    var title_info = 0;
    var i = 0;
    var meal = {};
    var data;
    $('tr > .textC').slice(8,13).each(function(){
      title_info = $(this).text();
      meal[i] = title_info;
      console.log(title_info);
      i++;
    });
    //알맞은 메시지 내용 출력
    switch (req.body.content) {
      case "오늘 급식":
        if(day > 5){
         week = ["월", "화", "수", "목", "금"];
         meala = "다음 주 급식을 알려드립니다.\n\n";
          for (a = 0; a < 5; a++){
            meala = meala+week[a]+":  "+meal[a]+"\n \n";
          }
          data = {
            "message": {
              "text": mm+"월"+dd+"일 급식 정보가 없습니다: \n \n "+meala
            },
            "keyboard": {
              "type" : "buttons",
              "buttons" : ["오늘 급식", "이번 주 급식", "다음 주 급식"]
            }
          };
        } else {
          data = {
            "message": {
              "text": mm+"월"+dd+"일 급식입니다: \n \n "+meal[day-1]
            },
            "keyboard": {
              "type" : "buttons",
              "buttons" : ["오늘 급식", "이번 주 급식", "다음 주 급식"]
            }
          };
        }
        break;
      case "이번 주 급식":
        week = ["월", "화", "수", "목", "금"];
        meala = "이번 주 급식을 알려드립니다.\n\n";
        for (a = 0; a < 5; a++){
          meala = meala+week[a]+":  "+meal[a]+"\n \n";
        }
        data = {
          "message": {
            "text": meala
          },
          "keyboard": {
            "type" : "buttons",
            "buttons" : ["오늘 급식", "이번 주 급식", "다음 주 급식"]
          }
        };
        break;
      case "다음 주 급식":
        week = ["월", "화", "수", "목", "금"];
        meala = "다음 주 급식을 알려드립니다.\n\n";
        for (a = 0; a < 5; a++){
          meala = meala+week[a]+":  "+meal[a]+"\n \n";
        }
        data = {
          "message": {
            "text": meala
          },
          "keyboard": {
            "type" : "buttons",
            "buttons" : ["오늘 급식", "이번 주 급식", "다음 주 급식"]
          }
        };
        break;
    }
    console.log(day);
    //플러스친구로 응답
    res.json(data);
  });
});

//키보드 요청
app.get('/keyboard', function(req, res) {
  var data = {
  "type" : "buttons",
  "buttons" : ["오늘 급식", "이번 주 급식", "다음 주 급식"]
  };
  res.json(data);
});
//서버 열기
http.createServer(app).listen(8080, function() {
  console.log("hi");
});

var aa = new Date("August 20, 2019 11:13:00");
getPostT(aa);
