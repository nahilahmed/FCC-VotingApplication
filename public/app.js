(function(){
     var app = angular.module('app',['ngRoute','angular-jwt']);

     app.config(function($routeProvider,$locationProvider){
          $locationProvider.html5Mode('true');
          $routeProvider.when('/',{
                templateUrl:"./templates/main.html",
                controller:"MainController",
                controllerAs:'vm'
          });
          $routeProvider.when('/login',{
                templateUrl:"./templates/login.html",
                controller:"LoginController",
                controllerAs:'vm'
          });
          $routeProvider.when('/register',{
                templateUrl:"./templates/register.html",
                controller:"RegisterController",
                controllerAs:'vm'
          });
          $routeProvider.when('/polls',{
                templateUrl:"./templates/polls.html",
                controller:"PollsController",
                controllerAs:'vm'
          });
          $routeProvider.when('/polls/:id',{
                templateUrl:"./templates/poll.html",
                controller:"PollController",
                controllerAs:'vm'
          });
          $routeProvider.when('/profile',{
                templateUrl:"./templates/profile.html",
                controller:"ProfileController",
                controllerAs:'vm'
          });
      })

          app.controller('MainController',function($location,$window){
              var vm = this;
              vm.title = "MainController";
              console.log("1");
          });
          
          app.controller('LoginController',function($location,$window){
              var vm = this;
              vm.title = "LoginController";
              console.log("2");
          });
          app.controller('RegisterController',RegisterController);
          function RegisterController($location,$window){
              var vm = this;
              vm.title = "RegisterController";
          }
          app.controller('PollsController',PollsController);
          function PollsController($location,$window){
              var vm = this;
              vm.title = "PollsController";
          }
          app.controller('PollController',PollController);
          function PollController($location,$window){
              var vm = this;
              vm.title = "PollController";
          }
          app.controller('ProfileController',ProfileController);
          function ProfileController($location,$window){
              var vm = this;
              vm.title = "ProfileController";
          }
}())
