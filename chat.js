var module = angular.module('SChat', []);
var API_URI = 'http://153.120.128.141';

module.service('chatfunc', ['$http', function($http){
  this.getUsers = function(callback){
    $http({
      url: API_URI + '/users',
      method: 'GET',
      headers: {
        'Content-Type': 'json'
      }
    }).success(function(data){
      callback(data);
    }).error(function(){
      alert("何かがおかしいようです。");
    });
  };
  this.getText = function(index, callback){
    $http.get(API_URI + '/texts/'+ index)
    .success(function(data){
      callback(data);
    }).error(function(data){
      callback(null);
    });
  };

  this.registUser = function(userName, callback){
    $http.post(API_URI + '/users', {name: userName}).success(function(data){callback(data)});
  };

  this.sendText = function(text, userId, date, callback){
    $http.post(API_URI + '/texts', {text: text, user_id: userId, date: date})
    .success(function(data){
      callback(data);
    });
  };
}]);


module.controller('users', ['$scope','chatfunc', function($scope, chatfunc){

}]);

module.controller('chat', ['$scope', '$interval', 'chatfunc', function($scope, $interval, chatfunc){
  $scope.texts = [];
  $scope.users = ["test1", "test2"];
  $scope.user = {};
  $scope.isRegist = false;
  $scope.init = function(){
    $scope.chatIndex = 1;
    $scope.chatLoad();
  };

  $scope.getUsers = function(){
    chatfunc.getUsers(function(data){
      $scope.users = data;
    });
  };

  $scope.registUser = function(){
    chatfunc.registUser($scope.user.name, function(data){
      $scope.user = data;
      $scope.isRegist = true;
      $scope.getUsers();
    });
  };

  $scope.getUserName = function(index){
    var user = $scope.users.filter(function(e){
      return e.id == index;
    });
    return user;
  };
  $scope.loading = null;
  $scope.chatLoad = function(){
    chatfunc.getText($scope.chatIndex, chatAutoLoad);
  };

  function chatAutoLoad(data){
    if(data != null){
      $scope.chatIndex += 1;
      $scope.texts.push(data);
      chatfunc.getText($scope.chatIndex, chatAutoLoad);
    }else{
      if($scope.loading == null){
        $scope.loading = $interval(function(){
        chatfunc.getText($scope.chatIndex, chatAutoLoad);
        console.log("test");
        }, 10000);
      }
    }
  };

  $scope.sendChat = function(){
    chatfunc.sendText($scope.text,
    $scope.user.id,
    formatDate(new Date(), "YYYY-MM-DD hh:mm:ss"),
    function(){
      $scope.text = "";
      $scope.chatLoad();
    });
    // $scope.text = "";
    // $scope.chatLoad();
  };
}]);

var formatDate = function (date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};
