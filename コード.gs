var API_TOKEN = "AAA";
var spreadsheet = SpreadsheetApp.openById('BBB');　
var sheetName = 'XXX';  //チャットから書き込む対象のシート
var sheet = spreadsheet.getSheetByName(sheetName);
var spreadsheetMember = SpreadsheetApp.openById('CCC');　　
var sheetNameMember = 'YYY';  //アカウントIDと名前をリンクさせるシート
var sheetMember = spreadsheetMember.getSheetByName(sheetNameMember);
var data = sheetMember.getDataRange().getValues();

function doPost(e){
  
  var accountIdRow = 8;
  var nameRow = 9;
  var targetIndex = [];
  
  var json = JSON.parse(e.postData.contents);
  var roomId = json.webhook_event.room_id;
  var accountId = json.webhook_event.account_id;
  var messagesId = json.webhook_event.message_id;
  var jsonBody = json.webhook_event.body;
  var bodyArray = jsonBody.split("\n"); //１行目がタイトル,２行目がURL,それ以下が説明
  var params = {
    headers: {"X-ChatWorkToken":API_TOKEN},
    method: "post"
  };
  var url = "https://api.chatwork.com/v2/rooms/roomId/messages";
  var body = ''
  var topWords = bodyArray[0].trim();
  var secondWords = bodyArray[1].trim();
  var thirdWords = bodyArray[2].trim();
  var today = Utilities.formatDate(new Date(), 'Asia/Tokyo','yyyy/MM/dd'); //表示形式を変更
  
  if(secondWords.match(/http/)){
    try{
      
      for (var i = data.length - 1; i > 0; i--){
        if(accountId == data[i][accountIdRow]){
          targetIndex.push(i);
          break;
        }
      }
      
      var targetRow = targetIndex[0];
      
      //データがなかったら終了
      if(!targetRow){
        return;
      }
      
      //チャットルームに登録された内容の説明部分をまとめる。
      var contents = ""
      for(var p = 2; p<bodyArray.length; p++){
        if(bodyArray[p]==""){
          continue;
        }
        if(p == bodyArray.length-1){
          contents += bodyArray[p].trim();
        }else{
          contents += bodyArray[p].trim()+"\n";
        }
      }
      
      var accountName = data[targetRow][nameRow]; //アカウントIDと名前が記載されてあるスプレッドシートから、名前を取得する。
      
      sheet.appendRow([accountName, today, topWords, secondWords,contents]); //対象のスプレッドシートに登録
      
    }catch(ex){
      var body = ''
      body += '[rp aid=' + accountId;
      body += ' to=' + roomId + '-' + messagesId + '] '
      body += '[info]シェアチャットにエラーが出たため登録できませんでした。[/info]'
      params.payload = {body :body};
      UrlFetchApp.fetch(url,params);
      return false;
    }
  }
}
