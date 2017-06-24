var htmlseconds1, htmlseconds2, splitseconds1, splitseconds2,
    htmlseconds_black, htmlseconds_white, splitseconds_black, splitseconds_white,
    server_sent_w_time, server_sent_b_time, server_sent_now_playing;
    
    var chesstimer = 60; // set the number of seconds here
    
    var fiveMinutes1 = chesstimer * 1;
    var fiveMinutes2 = chesstimer * 1;
    var t = "01:00";
    var initial_timer_for_white = chesstimer;
    var initial_interval_for_black = chesstimer*1000;
    var generic_interval = 1000;
    
    var display1 = document.querySelector('#player1timer');
    var display2 = document.querySelector('#player2timer');
    var setIntervalPlayer1, setIntervalPlayer2;

   
    function startTimerforPlayer1(duration, display, intvl) {
            var timer = duration, minutes, seconds;
            setIntervalPlayer1 = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = minutes + ":" + seconds;

                if (--timer <= 0) {
                    timer = 0;
                        display.textContent = "00:00";
                        //stopTimerforPlayer1();
                        var modal = document.getElementById('myModal');
                        console.log(modal);
                        modal.style.display = "block";
                            stopTimerforPlayer1();
                            stopTimerforPlayer2();

                }
            }, intvl);

        }

    function startTimerforPlayer2(duration, display, intvl) {
            var timer = duration, minutes, seconds;
            setIntervalPlayer2 = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = minutes + ":" + seconds;

                if (--timer <= 0) {
                    timer = 0;
                        display.textContent = "00:00";
                        //stopTimerforPlayer2();
                        var modal = document.getElementById('myModal');
                        console.log(modal);
                        modal.style.display = "block";
                    stopTimerforPlayer1();
                    stopTimerforPlayer2();
                }
            }, intvl);

        }

        function stopTimerforPlayer1(){
            clearInterval(setIntervalPlayer1);
        }
        function stopTimerforPlayer2(){
            clearInterval(setIntervalPlayer2);
        } 


(function () {
    
    WinJS.UI.processAll().then(function () {
      
      var socket, serverGame;
      var username, playerColor;
      var game, board;
      var usersOnline = [];
      var myGames = [];
      socket = io();
           
      //////////////////////////////
      // Socket.io handlers
      ////////////////////////////// 
      
      socket.on('login', function(msg) {
            usersOnline = msg.users;
            updateUserList();
            
            myGames = msg.games;
            updateGamesList();
      });
      
      socket.on('joinlobby', function (msg) {
        addUser(msg);
      });
      
       socket.on('leavelobby', function (msg) {
        removeUser(msg);
      });
      
      socket.on('gameadd', function(msg) {
      });
      
      socket.on('resign', function(msg) {
            if (msg.gameId == serverGame.id) {

              socket.emit('login', username);

              $('#page-lobby').show();
              $('#page-game').hide();
            }            
      });
                  
      socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );   
        playerColor = msg.color;
        initGame(msg.game);
        
        $('#page-lobby').hide();
        $('#page-game').show();
        
      });
        
      socket.on('move', function (msg) {
                 
                if (serverGame && msg.gameId === serverGame.id) {
                   game.move(msg.move);
                   board.position(game.fen()); 
                    
                server_sent_w_time = msg.timer_white;
                server_sent_b_time = msg.timer_black;
                server_sent_now_playing = msg.now_playing
                console.log(server_sent_w_time,server_sent_b_time,server_sent_now_playing);
                
                stopTimerforPlayer1();
                stopTimerforPlayer2();
                if (game.turn() === 'w') startTimerforPlayer1(server_sent_w_time, display1, generic_interval);
                if (game.turn() === 'b') startTimerforPlayer2(server_sent_b_time, display2, generic_interval);
                 
                } 
  
      });   
       
      socket.on('logout', function (msg) {
        removeUser(msg.username);
      });
      

      
      //////////////////////////////
      // Menus
      ////////////////////////////// 
      $('#login').on('click', function() {
        username = $('#username').val();
        
        if (username.length > 0) {
            $('#userLabel').text(username);
            socket.emit('login', username);
            
            $('#page-login').hide();
            $('#page-lobby').show();
        } 
      });
      
      $('#game-back').on('click', function() {
        socket.emit('login', username);
        
        $('#page-game').hide();
        $('#page-lobby').show();
      });
      
      $('#game-resign').on('click', function() {
        socket.emit('resign', {userId: username, gameId: serverGame.id});
        
        socket.emit('login', username);
        $('#page-game').hide();
        $('#page-lobby').show();
      });
      
      var addUser = function(userId) {
        usersOnline.push(userId);
        updateUserList();
      };
    
     var removeUser = function(userId) {
          for (var i=0; i<usersOnline.length; i++) {
            if (usersOnline[i] === userId) {
                usersOnline.splice(i, 1);
            }
         }
         
         updateUserList();
      };
      
      var updateGamesList = function() {
        document.getElementById('gamesList').innerHTML = '';
        myGames.forEach(function(game) {
          $('#gamesList').append($('<button>')
                        .text('#'+ game)
                        .on('click', function() {
                          socket.emit('resumegame',  game);
                        }));
        });
      };
      
      var updateUserList = function() {
        document.getElementById('userList').innerHTML = '';
        usersOnline.forEach(function(user) {
          $('#userList').append($('<button>')
                        .text(user)
                        .on('click', function() {
                          socket.emit('invite',  user);
                        }));
        });
      };
           
      //////////////////////////////
      // Chess Game
      ////////////////////////////// 
      
      var initGame = function (serverGameState) {
        serverGame = serverGameState; 
        
          var cfg = {
            draggable: true,
            showNotation: false,
            orientation: playerColor,
            position: serverGame.board ? serverGame.board : 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd
          };
               
          game = serverGame.board ? new Chess(serverGame.board) : new Chess();
          board = new ChessBoard('game-board', cfg);

            //document.getElementById("player1timer").innerHTML = t;
          
          startTimerforPlayer1(chesstimer, display1, generic_interval); // white initial timer as the game starts
          //startTimerforPlayer2(chesstimer, display2, initial_interval_for_black); // white initial timer as the game starts

          document.getElementById("player2timer").innerHTML = t; // black initial timer as game starts
        


      }
 
     
      
      // do not pick up pieces if the game is over
      // only pick up pieces for the side to move
      var onDragStart = function(source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
            (game.turn() !== playerColor[0])) {
          return false;
        }
      };  
      
      
      var onDrop = function(source, target) {
        // see if the move is legal
        var move = game.move({
          from: source,
          to: target,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
      
        // illegal move
        if (move === null) { 
          return 'snapback';
        } else {       
            
            var imov = 1;
           
                                htmlseconds_white = document.getElementById("player1timer").innerHTML;
                                htmlseconds_black = document.getElementById("player2timer").innerHTML;

                                if (imov > 0) {
                                    stopTimerforPlayer2();
                                }
                                                imov++;

                                stopTimerforPlayer1();
            
                                splitseconds_white = htmlseconds_white.split(':');                
                                //minutes are worth 60 seconds. 
                                fiveMinutes_white = ((+splitseconds_white[0])*60) + (+splitseconds_white[1]);
            
                                splitseconds_black = htmlseconds_black.split(':');                
                                //minutes are worth 60 seconds. 
                                fiveMinutes_black = ((+splitseconds_black[0])*60) + (+splitseconds_black[1]);

            
           socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen(), playeremitted: username, timer_white: fiveMinutes_white, timer_black: fiveMinutes_black, now_playing: game.turn });
                        
            
            if (game.turn() === 'w') startTimerforPlayer1(fiveMinutes_white, display1, generic_interval);
            if (game.turn() === 'b') startTimerforPlayer2(fiveMinutes_black, display2, generic_interval);


            
        }
      
      };
      
      // update the board position after the piece snap 
      // for castling, en passant, pawn promotion
      var onSnapEnd = function() {
        board.position(game.fen());
      };
    });
})();

