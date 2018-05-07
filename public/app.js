(function(){
     var app = angular.module('app',['ngRoute','angular-jwt']);

     app.run(function($rootScope, $location, $window, $http) {

        // Add default Authorization Bearer header to be validated with each request

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token

        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            if(nextRoute.access !== undefined && nextRoute.access.restricted === true  &&  !$window.localStorage.token) {
                event.preventDefault();
                $location.path('/login');
            }
            if($window.localStorage.token && nextRoute.access.restricted === true) {

                $http.post('/api/verify-token', { token: $window.localStorage.token })
                     .then(function(response) {
                         console.log('your token is valid')
                     }, function(err) {
                         // invalid token. delete token in local storage to prevent further inauthentic requests to API
                         delete $window.localStorage.token;
                         $location.path('/login')
                     })
            }
        });
})

     app.config(function($routeProvider,$locationProvider){
          $locationProvider.html5Mode('true');
          $routeProvider.when('/',{
                templateUrl:"./templates/main.html",
                controller:"MainController",
                controllerAs:'vm',
                access: {
                restricted: false
                }

          });
          $routeProvider.when('/login',{
                templateUrl:"./templates/login.html",
                controller:"LoginController",
                controllerAs:'vm',
                access: {
                restricted: false
                }
          });
          $routeProvider.when('/register',{
                templateUrl:"./templates/register.html",
                controller:"RegisterController",
                controllerAs:'vm',
                access: {
                restricted: false
                }
          });
          $routeProvider.when('/polls',{
                templateUrl:"./templates/polls.html",
                controller:"PollsController",
                controllerAs:'vm',
                access: {
                restricted: false
                }
          });
          $routeProvider.when('/polls/:id',{
                templateUrl:"./templates/poll.html",
                controller:"PollController",
                controllerAs:'vm',
                access: {
                restricted: false
                }
          });
          $routeProvider.when('/profile',{
                templateUrl:"./templates/profile.html",
                controller:"ProfileController",
                controllerAs:'vm',
                access: {
                restricted: true
                }
          });
      })

          app.controller('MainController',function($location,$window){
              var vm = this;
              vm.title = "MainController";
              console.log("1");
          });

          app.controller('LoginController',function($location,$window,$http){
              var vm = this;
              vm.title = "LoginController";
              vm.error = "";
              vm.login = function(){
                if(vm.user){
                  $http.post('/api/login',vm.user)
                       .then(function(response){
                         //console.log(response);
                         console.log("Succesfully signed in");
                         $window.localStorage.token = response.data;
                         $location.path('/profile');
                       },function(err){
                          vm.error = err ;
                       })
                  }
                  else{
                    console.log("No Credentials");
                  }
                }
              });
          app.controller('RegisterController',RegisterController);
          function RegisterController($location,$window,$http){
              var vm = this;
              vm.title = "RegisterController";
              vm.error = "";
              vm.register = function(){
                  if(!vm.user){
                    console.log("Invalid User Credentials");
                    return;
                  }
                  $http.post('/api/register',vm.user)
                       .then(function(response) {
                              $window.localStorage.token = response.data;
                              $location.path('/profile');
                       },function(err){
                           console.log(err);
                       });
              }
          }
          app.controller('PollsController',PollsController);
          function PollsController($location,$window,$http,jwtHelper){
            var vm = this;
            vm.title = "PollsController";
            vm.polls = [];
            vm.poll = {
              name: '',
              options: [{
                name: '',
                votes: 2
              }]
            }
        vm.isLoggedIn = function() {
            if(!$window.localStorage.token) {
                return false;
            }
            if(jwtHelper.decodeToken($window.localStorage.token)) {
                return true;
            }
            return false;
        }
        vm.isLoggedIn();


        vm.getAllPolls = function() {
            $http.get('/api/polls').then(function(response) {
                vm.polls = response.data;
            });
        }
        vm.getAllPolls();

        vm.addPoll = function() {
            if(!$window.localStorage.token) {
                alert('Cannot create a poll without an account');
                return;
            }
            if(vm.poll) {
                var payload = {
                    owner: jwtHelper.decodeToken($window.localStorage.token).data.name || null,
                    name: vm.poll.name,
                    options: vm.poll.options,
                    token: $window.localStorage.token
                }
                $http.post('/api/polls' , payload).then(onSuccess, onError);
            }
            else {
                console.log('No poll data supplied');
            }
        }
        vm.addOption = function() {
            vm.poll.options.push({
                name: '',
                votes: 2
            })
        }

        var onSuccess = function(response) {
            console.log(response.data)
            vm.poll = {};
            vm.getAllPolls();
        }
        var onError = function(err) {
            console.error(err)
          }
      }

          app.controller('PollController',PollController);
          function PollController($location,$window){
              var vm = this;
              vm.title = "PollController";
          }
          app.controller('ProfileController',ProfileController);
          function ProfileController(jwtHelper, $window, $location, $http, $timeout) {
            var vm = this;
            vm.title = "ProfileController";
            vm.currentUser = null;
            vm.polls = [];
            var token = $window.localStorage.token;

            vm.getPollsByUser = function() {
              $http.get('/api/user-polls/'+ vm.currentUser.name)
                  .then(function(response) {
                      console.log(response);
                      vm.polls = response.data;
                    }, function(err) {
                      console.log("Screwed");
                      console.log(err)
                    })
                  }

            vm.deletePoll = function(id) {
              console.log(id);
              if(id !== null) {
                  $http.delete('/api/polls/' + id).then(function(response) {
                      vm.getPollsByUser();
                    }, function(err) {
                      console.log(err)
                    })

                  }
                  else {
                    return false;
                  }
                }

            if(token) {
              vm.currentUser = jwtHelper.decodeToken(token).data;
              if(vm.currentUser !== null )  {
                vm.getPollsByUser()
              }
            }

            vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }

    }
}())
