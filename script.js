(function() {
  "use strict";

  var app = angular.module("plnkrGanttStable", [
    "gantt",
    "gantt.sortable",
    "gantt.movable",
    // 'gantt.drawtask',
    "gantt.tooltips",
    "gantt.bounds",
    "gantt.progress",
    "gantt.table",
    "gantt.tree",
    "gantt.groups",
    "gantt.resizeSensor",
    "gantt.overlap",
    "gantt.dependencies",
    "ui.bootstrap"
  ]);

  window.addEventListener("click", e => {

    if(!e.target.classList.contains('menu-option')){
      const menu = document.querySelector(".menu");
      menu.style.display = 'none';
    }

    if(!e.target.classList.contains('chart') && !e.target.classList.contains('menu-option')){
      let chart = document.querySelector('.chart');
      chart.style.display = 'none';
    }
    
  });

  var x;
  var can_show_edit = false;
  var task_moved = false;
  app.controller("Ctrl", [
    "$scope",
    "$timeout",
    "$uibModal",
    function($scope, $timeout, $uibModal) {      

      $scope.registerApi = function(api) {
        console.log(api);
        $timeout(function() {
          console.log(api);
          api.dependencies.on.add($scope, function(dependency) {
            console.log(dependency);
          });
        }, 5000);

        api.core.on.ready($scope, function() {
          api.directives.on.new($scope, function(
            directiveName,
            directiveScope,
            element
          ) {
            console.log(directiveName);

            if (directiveName === "ganttTask") {
              
              element.bind("click", function(event) {
                event.stopPropagation();
                console.log("ganttTask click performed" + directiveScope.task.model.name);
                $scope.taskToEdit = directiveScope.task.model;
                var modalInstanceEdit = $uibModal.open({
                  templateUrl: "modalContentEdit.html",
                  controller: "ModalContentEditCtrl",
                  size: '',
                  scope: $scope,
                });
              });

              element.on("contextmenu", function(event) {
                event.preventDefault();
                const menu = document.querySelector(".menu");
                menu.style.display = 'block';
                menu.style.left = event.clientX + 'px';
                menu.style.top = (event.clientY+10)+'px';
                $scope.taskid = directiveScope.task.model.id;
                // if (
                //   directiveScope.row.removeTask(directiveScope.task.model.id)
                // ) {
                //   directiveScope.row.$scope.$digest();
                // }


              });


            } else if (directiveName === "ganttRow") {
              
                
              element.bind("dblclick", function(event) {
                event.stopPropagation();
                console.log("Row Clicked Id : " + directiveScope.row.model.id);
                $scope.rowClickedId = directiveScope.row.model.id;
                var modalInstance =  $uibModal.open({
                  templateUrl: "modalContent1.html",
                  controller: "ModalContentCtrl",
                  size: '',
                  scope: $scope,
                });
                console.log(
                  "ganttRow click performed" + directiveScope.row.model.name
                );
                
              });
            } else if (directiveName === "ganttRowLabel") {
              element.bind("click", function() {
                event.stopPropagation();
                console.log(
                  "ganttRowLabel click performed" +
                    directiveScope.row.model.name
                );
              });
            }
          });

          api.tasks.on.resizeEnd($scope, function(task) {
            task_moved = true;

            console.log("task_moved" + task_moved);
            console.log("can_show_edit" + can_show_edit);
            can_show_edit = true;
            console.log("from" + task.model.from);
            console.log("to" + task.model.to);
            console.log("name" + task.model.name);
            var date = new Date(task.model.from);
            var date1 = new Date(task.model.to);
            console.log("from" + date.toString());
            console.log("to" + date1.toString());
          });
          api.tasks.on.moveEnd($scope, function(task, newRow) {
            $http.post(url, task.model).success(function(json) {
              can_show_edit = true;
              // Do something in case of move End
            });
          });
        });
      };

      $scope.gantt = {
        timeFrames: {
          day: {
            start: moment("08:00", "HH:mm"),
            end: moment("22:00", "HH:mm"),
            working: true,
            default: true
          }
        },
        headers: ["day", "hour"],
        viewScale: "3 hours",
        columnWidth: 50,
        timeFramesNonWorkingMode: "cropped"
      };
      $scope.endPoints = [
        // {
        //     anchor:'TopLeft',
        //     isSource:false,
        //     isTarget:true,
        //     maxConnections: -1,
        //     cssClass: 'gantt-endpoint start-endpoint target-endpoint',
        // },
        // {
        //     anchor:'BottomLeft',
        //     isSource:true,
        //     isTarget:false,
        //     maxConnections: -1,
        //     cssClass: 'gantt-endpoint end-endpoint source-endpoint',
        // },
        {
          anchor: "Left",
          isSource: true,
          isTarget: true,
          maxConnections: -1,
          cssClass: "gantt-endpoint end-endpoint target-endpoint"
        },
        {
          anchor: "Right",
          isSource: true,
          isTarget: false,
          maxConnections: -1,
          cssClass: "gantt-endpoint start-endpoint source-endpoint"
        }
      ];
      // $scope.data = [
      //     // Order is optional. If not specified it will be assigned automatically
      //     {name: 'Milestones', height: '3em', sortable: false, classes: 'gantt-row-milestone', color: '#45607D', tasks: [
      //         // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
      //         {name: 'Kickoff', color: '#93C47D', from: '2013-10-07T09:00:00', to: '2013-10-07T10:00:00', data: 'Can contain any custom data or object'},
      //         {name: 'Concept approval', color: '#93C47D', from: new Date(2013, 9, 18, 18, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0), est: new Date(2013, 9, 16, 7, 0, 0), lct: new Date(2013, 9, 19, 0, 0, 0)},
      //         {name: 'Development finished', color: '#93C47D', from: new Date(2013, 10, 15, 18, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
      //         {name: 'Shop is running', color: '#93C47D', from: new Date(2013, 10, 22, 12, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0)},
      //         {name: 'Go-live', color: '#93C47D', from: new Date(2013, 10, 29, 16, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0)}
      //     ], data: 'Can contain any custom data or object'},
      //     {name: 'Status meetings', tasks: [
      //         {name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0)},
      //         {name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0)},
      //         {name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0)},
      //         {name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
      //         {name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0)}
      //     ]},
      //     {name: 'Kickoff', movable: {allowResizing: false}, tasks: [
      //         {name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0),
      //             progress: {percent: 100, color: '#3C8CF8'}, movable: false},
      //         {name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0),
      //             progress: {percent: 100, color: '#3C8CF8'}},
      //         {name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0),
      //             progress: {percent: 100, color: '#3C8CF8'}}
      //     ]},
      //     {name: 'Create concept', tasks: [
      //         {name: 'Create concept', priority: 20, content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}', color: '#F1C232', from: new Date(2013, 9, 10, 8, 0, 0), to: new Date(2013, 9, 16, 18, 0, 0), est: new Date(2013, 9, 8, 8, 0, 0), lct: new Date(2013, 9, 18, 20, 0, 0),
      //             progress: 100}
      //     ]},
      //     {name: 'Finalize concept', tasks: [
      //         {id: 'Finalize concept',classes: 'finalize_concept', name: 'Finalize concept', priority: 10, color: '#F1C232', from: new Date(2013, 9, 17, 8, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0),
      //             progress: 100}
      //     ]},
      //     {name: 'Development', children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}'},
      //     {name: 'Sprint 1', tooltips: false, tasks: [
      //         {id: 'Product list view', classes: 'sprint_1', name: 'Product list view', color: '#F1C232', from: new Date(2013, 9, 21, 8, 0, 0), to: new Date(2013, 9, 25, 15, 0, 0),
      //             progress: 25, dependencies: [{to: 'Order basket'}, {from: 'Finalize concept'}]}
      //     ]},
      //     {name: 'Sprint 2', tasks: [
      //         {id: 'Order basket', name: 'Order basket', color: '#F1C232', from: new Date(2013, 9, 28, 8, 0, 0), to: new Date(2013, 10, 1, 15, 0, 0),
      //             dependencies: {to: 'Checkout', connectParameters: {endpoint: ['Rectangle', {width: 12, height: 12}]}}}
      //     ]},
      //     {name: 'Sprint 3', tasks: [
      //         {id: 'Checkout', name: 'Checkout', color: '#F1C232', from: new Date(2013, 10, 4, 8, 0, 0), to: new Date(2013, 10, 8, 15, 0, 0),
      //             dependencies: {to: 'Login & Signup & Admin Views'}}
      //     ]},
      //     {name: 'Sprint 4', tasks: [
      //         {id: 'Login & Signup & Admin Views', name: 'Login & Signup & Admin Views', color: '#F1C232', from: new Date(2013, 10, 11, 8, 0, 0), to: new Date(2013, 10, 15, 15, 0, 0),
      //             dependencies: [{to: 'HW'}, {to: 'SW / DNS/ Backups'}]}
      //     ]},
      //     {name: 'Hosting'},
      //     {name: 'Setup', tasks: [
      //         {id: 'HW', name: 'HW', color: '#F1C232', from: new Date(2013, 10, 18, 8, 0, 0), to: new Date(2013, 10, 18, 12, 0, 0)}
      //     ]},
      //     {name: 'Config', tasks: [
      //         {id: 'SW / DNS/ Backups', name: 'SW / DNS/ Backups', color: '#F1C232', from: new Date(2013, 10, 18, 12, 0, 0), to: new Date(2013, 10, 21, 18, 0, 0)}
      //     ]},
      //     {name: 'Server', parent: 'Hosting', children: ['Setup', 'Config']},
      //     {name: 'Deployment', parent: 'Hosting', tasks: [
      //         {name: 'Depl. & Final testing', color: '#F1C232', from: new Date(2013, 10, 21, 8, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0), 'classes': 'gantt-task-deployment'}
      //     ]},
      //     {name: 'Workshop', tasks: [
      //         {name: 'On-side education', color: '#F1C232', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 25, 15, 0, 0)}
      //     ]},
      //     {name: 'Content', tasks: [
      //         {name: 'Supervise content creation', color: '#F1C232', from: new Date(2013, 10, 26, 9, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0)}
      //     ]},
      //     {name: 'Documentation', tasks: [
      //         {name: 'Technical/User documentation', color: '#F1C232', from: new Date(2013, 10, 26, 8, 0, 0), to: new Date(2013, 10, 28, 18, 0, 0)}
      //     ]}
      // ];

      $timeout(function() {
        $scope.data = [
          // Order is optional. If not specified it will be assigned automatically
          {
            id:1,
            name: "Milestones",
            height: "3em",
            sortable: false,
            classes: "gantt-row-milestone",
            color: "#45607D",
            tasks: [
              // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
              {
                id:2,
                name: "Kickoff",
                color: "#93C47D",
                from: "2013-10-07T09:00:00",
                to: "2013-10-07T10:00:00",
                data: "Can contain any custom data or object"
              },
              {
                id:2,
                name: "Concept approval",
                color: "#93C47D",
                from: new Date(2013, 9, 18, 18, 0, 0),
                to: new Date(2013, 9, 18, 18, 0, 0),
                est: new Date(2013, 9, 16, 7, 0, 0),
                lct: new Date(2013, 9, 19, 0, 0, 0)
              },
              {
                id:3,
                name: "Development finished",
                color: "#93C47D",
                from: new Date(2013, 10, 15, 18, 0, 0),
                to: new Date(2013, 10, 15, 18, 0, 0)
              },
              {
                id:4,
                name: "Shop is running",
                color: "#93C47D",
                from: new Date(2013, 10, 22, 12, 0, 0),
                to: new Date(2013, 10, 22, 12, 0, 0)
              },
              {
                id:5,
                name: "Go-live",
                color: "#93C47D",
                from: new Date(2013, 10, 29, 16, 0, 0),
                to: new Date(2013, 10, 29, 16, 0, 0)
              }
            ],
            data: "Can contain any custom data or object"
          },
          {
            id:6,
            name: "Status meetings",
            tasks: [
              {
                name: "Demo #1",
                color: "#9FC5F8",
                from: new Date(2013, 9, 25, 15, 0, 0),
                to: new Date(2013, 9, 25, 18, 30, 0)
              },
              {
                name: "Demo #2",
                color: "#9FC5F8",
                from: new Date(2013, 10, 1, 15, 0, 0),
                to: new Date(2013, 10, 1, 18, 0, 0)
              },
              {
                name: "Demo #3",
                color: "#9FC5F8",
                from: new Date(2013, 10, 8, 15, 0, 0),
                to: new Date(2013, 10, 8, 18, 0, 0)
              },
              {
                name: "Demo #4",
                color: "#9FC5F8",
                from: new Date(2013, 10, 15, 15, 0, 0),
                to: new Date(2013, 10, 15, 18, 0, 0)
              },
              {
                name: "Demo #5",
                color: "#9FC5F8",
                from: new Date(2013, 10, 24, 9, 0, 0),
                to: new Date(2013, 10, 24, 10, 0, 0)
              }
            ]
          },
          {
            id:7,
            name: "Kickoff",
            movable: { allowResizing: false },
            tasks: [
              {
                name: "Day 1",
                color: "#9FC5F8",
                from: new Date(2013, 9, 7, 9, 0, 0),
                to: new Date(2013, 9, 7, 17, 0, 0),
                progress: { percent: 100, color: "#3C8CF8" },
                movable: false
              },
              {
                name: "Day 2",
                color: "#9FC5F8",
                from: new Date(2013, 9, 8, 9, 0, 0),
                to: new Date(2013, 9, 8, 17, 0, 0),
                progress: { percent: 100, color: "#3C8CF8" }
              },
              {
                name: "Day 3",
                color: "#9FC5F8",
                from: new Date(2013, 9, 9, 8, 30, 0),
                to: new Date(2013, 9, 9, 12, 0, 0),
                progress: { percent: 100, color: "#3C8CF8" }
              }
            ]
          },
          // {
          //   name: "Create concept",
          //   tasks: [
          //     {
          //       name: "Create concept",
          //       priority: 20,
          //       content:'<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}',
          //       color: "#F1C232",
          //       from: new Date(2013, 9, 10, 8, 0, 0),
          //       to: new Date(2013, 9, 16, 18, 0, 0),
          //       est: new Date(2013, 9, 8, 8, 0, 0),
          //       lct: new Date(2013, 9, 18, 20, 0, 0),
          //       progress: 80
          //     }
          //   ]
          // },
          {
            id: 8,
            name: "Finalize concept",
            tasks: [
              {
                id: "Finalize concept",
                classes: "finalize_concept",
                name: "Finalize concept",
                priority: 10,
                color: "#F1C232",
                from: new Date(2013, 9, 17, 8, 0, 0),
                to: new Date(2013, 9, 18, 18, 0, 0),
                progress: 100
              }
            ]
          },
          {
            id:9,
            name: "Development",
            children: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"],
            content:
              '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}'
          },
          {
            id:10,
            name: "Sprint 1",
            tooltips: false,
            tasks: [
              {
                id: "Product list view",
                classes: "sprint_1",
                name: "Product list view",
                color: "#F1C232",
                from: new Date(2013, 9, 21, 8, 0, 0),
                to: new Date(2013, 9, 25, 15, 0, 0),
                progress: 25,
                dependencies: [
                  { to: "Order basket" },
                  {
                    from: "Finalize concept",
                    connectParameters: {
                      source: document.getElementsByClassName(
                        "finalize_concept"
                      ),
                      target: document.getElementsByClassName("sprint_1"),
                      anchors: ["Right", "Left"]
                      //endpoint:"dot"
                    }
                  }
                ]
              }
            ]
          },
          {
            id:11,
            name: "Sprint 2",
            tasks: [
              {
                id: "Order basket",
                name: "Order basket",
                color: "#F1C232",
                from: new Date(2013, 9, 28, 8, 0, 0),
                to: new Date(2013, 10, 1, 15, 0, 0),
                dependencies: {
                  to: "Checkout",
                  connectParameters: {
                    endpoint: ["Rectangle", { width: 12, height: 12 }]
                  }
                }
              }
            ]
          },
          {
            id:12,
            name: "Sprint 3",
            tasks: [
              {
                id: "Checkout",
                name: "Checkout",
                color: "#F1C232",
                from: new Date(2013, 10, 4, 8, 0, 0),
                to: new Date(2013, 10, 8, 15, 0, 0),
                dependencies: { to: "Login & Signup & Admin Views" }
              }
            ]
          },
          {
            id:13,
            name: "Sprint 4",
            tasks: [
              {
                id: "Login & Signup & Admin Views",
                name: "Login & Signup & Admin Views",
                color: "#F1C232",
                from: new Date(2013, 10, 11, 8, 0, 0),
                to: new Date(2013, 10, 15, 15, 0, 0),
                dependencies: [{ to: "HW" }, { to: "SW / DNS/ Backups" }]
              }
            ]
          },
          { 
            id:14,
            name: "Hosting" 
          },
          {
            id:16,
            name: "Setup",
            tasks: [
              {
                id: "HW",
                name: "HW",
                color: "#F1C232",
                from: new Date(2013, 10, 18, 8, 0, 0),
                to: new Date(2013, 10, 18, 12, 0, 0)
              }
            ]
          },
          {
            id:17,
            name: "Config",
            tasks: [
              {
                id: "SW / DNS/ Backups",
                name: "SW / DNS/ Backups",
                color: "#F1C232",
                from: new Date(2013, 10, 18, 12, 0, 0),
                to: new Date(2013, 10, 21, 18, 0, 0)
              }
            ]
          },
          {
            id:15,
            name: "Server",
            parent: "Hosting",
            children: ["Setup", "Config"]
          },
          {
            id:18,
            name: "Deployment",
            parent: "Hosting",
            tasks: [
              {
                name: "Depl. & Final testing",
                color: "#F1C232",
                from: new Date(2013, 10, 21, 8, 0, 0),
                to: new Date(2013, 10, 22, 12, 0, 0),
                classes: "gantt-task-deployment"
              }
            ]
          },
          {
            id:19,
            name: "Workshop",
            tasks: [
              {
                name: "On-side education",
                color: "#F1C232",
                from: new Date(2013, 10, 24, 9, 0, 0),
                to: new Date(2013, 10, 25, 15, 0, 0)
              }
            ]
          },
          {
            id:20,
            name: "Content",
            tasks: [
              {
                name: "Supervise content creation",
                color: "#F1C232",
                from: new Date(2013, 10, 26, 9, 0, 0),
                to: new Date(2013, 10, 29, 16, 0, 0)
              }
            ]
          },
          {
            id:21,
            name: "Documentation",
            tasks: [
              {
                name: "Technical/User documentation",
                color: "#F1C232",
                from: new Date(2013, 10, 26, 8, 0, 0),
                to: new Date(2013, 10, 28, 18, 0, 0)
              }
            ]
          }
        ];
      }, 1000);

      $scope.deleteTask = function(){
        const menu = document.querySelector(".menu");
        menu.style.display = 'none';
        
        for(let i=0; i < $scope.data.length; i++){

          if($scope.data[i].tasks == undefined){
            continue;
          }
          $scope.data[i].tasks = $scope.data[i].tasks.filter(function( obj ) {
            return obj.id !== $scope.taskid;
          });

        }
      }

      $scope.showChart = function(){
        let chart = document.querySelector('.chart');
        chart.style.display = 'block';
        const menu = document.querySelector(".menu");
        menu.style.display = 'none';
      }
    }

    
  ]);

  app.controller('ModalContentCtrl', function($scope, $uibModalInstance) {

    $scope.taskform = {};
    
    $scope.ok = function(){
      $uibModalInstance.close("Ok");
      console.log($scope.taskform);

      let fromDate = $scope.taskform.fromdate;
      let todate = $scope.taskform.todate;

      let task = {
        name : $scope.taskform.name,
        from: moment(new Date(fromDate.getYear()+1900, fromDate.getMonth(), fromDate.getDate(), 0, 0, 0)),
        to: moment(new Date(todate.getYear()+1900, todate.getMonth(), todate.getDate(), 0, 0, 0)),
        color: "#F1C232",
      };
      
      let data = $scope.data.find(function(element){
        return element.id == $scope.rowClickedId;
      });

      console.log(data);

      if(data.tasks == undefined){
        data.tasks = [];
        data.tasks.push(task);
      }else{
        data.tasks.push(task);
      }

      console.log(data);

    }
     
    $scope.cancel = function(){
      $uibModalInstance.dismiss();
    } 
    
  });

  app.controller('ModalContentEditCtrl', function($scope, $uibModalInstance) {

    $scope.taskformedit = {};

    $scope.taskformedit.name = $scope.taskToEdit.name;
    $scope.taskformedit.fromdate = $scope.taskToEdit.from.toDate() ;
    $scope.taskformedit.todate = $scope.taskToEdit.to.toDate() ;

    $scope.editok = function(){
      $uibModalInstance.close("Ok");
      
       for(let i=0; i < $scope.data.length; i++){

        if($scope.data[i].tasks == undefined){
          continue;
        }

        let editTask = $scope.data[i].tasks.find(function(element){
          return element.id == $scope.taskToEdit.id;
        });

         if(editTask){

           let fromDate = $scope.taskformedit.fromdate;
           let todate = $scope.taskformedit.todate;

           console.log(fromDate + ', '+todate);

           editTask.name = $scope.taskformedit.name;
           editTask.from = moment(new Date(fromDate.getYear()+1900, fromDate.getMonth(), fromDate.getDate(), 0, 0, 0));
           editTask.to = moment(new Date(todate.getYear()+1900, todate.getMonth(), todate.getDate(), 0, 0, 0));
           console.log('task found');
           return;
         }

       }



    }
    
    $scope.editcancel = function(){
      $uibModalInstance.dismiss();
    } 


  });
})();



