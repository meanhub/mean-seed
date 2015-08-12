angular.module('meanhub')
.controller('IndexController', [ 'IndexService', function(IndexService) {
    var indexXtrl = this;
    indexCtrl.welcomeMessage = IndexService.welcomeMessage;
}]);
