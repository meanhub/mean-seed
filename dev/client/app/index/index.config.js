angular.module('meanhub')
.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'static/app/index/index.tmpl.html',
            controller: 'indexCtrl',
            controllerAs: 'indexCtrl'
          });
});
