var htmlseconds1, htmlseconds2, splitseconds1, splitseconds2,
    fiveMinutes1 = 60 * 1,
    fiveMinutes2 = 60 * 1,
        display1 = document.querySelector('#player1timer'),
        display2 = document.querySelector('#player2timer');
    var setIntervalPlayer1, setIntervalPlayer2;

        function startTimerforPlayer1(duration, display) {
            var timer = duration, minutes, seconds;
            setIntervalPlayer1 = setInterval(function () {
                minutes = parseInt(timer / 60, 10)
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = minutes + ":" + seconds;

                if (--timer <= 0) {
                    timer = 0;
                        //stopTimerforPlayer1();
                        var modal = document.getElementById('myModal');
                        console.log(modal);
                        modal.style.display = "block";
                            stopTimerforPlayer1();
                            stopTimerforPlayer2();

                }
            }, 1000);

        }

        function startTimerforPlayer2(duration, display) {
            var timer = duration, minutes, seconds;
            setIntervalPlayer2 = setInterval(function () {
                minutes = parseInt(timer / 60, 10)
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = minutes + ":" + seconds;

                if (--timer <= 0) {
                    timer = 0;
                        //stopTimerforPlayer2();
                        var modal = document.getElementById('myModal');
                        console.log(modal);
                        modal.style.display = "block";
                    stopTimerforPlayer1();
                    stopTimerforPlayer2();
                }
            }, 1000);

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
          
            if (game.game_over() === true){
                        stopTimerforPlayer1();
                        stopTimerforPlayer2();
                    } 
                    else {
                                    //timer
                            if (game.turn() === 'b') {

                                htmlseconds1 = document.getElementById("player1timer").innerHTML;
                                splitseconds1 = htmlseconds1.split(':');                
                                //minutes are worth 60 seconds. 
                                fiveMinutes1 = ((+splitseconds1[0])*60) + (+splitseconds1[1]);

                                stopTimerforPlayer1();
                                startTimerforPlayer1(fiveMinutes1, display1);

                                //stop timer for opponent
                                htmlseconds2 = document.getElementById("player2timer").innerHTML;
                                stopTimerforPlayer2();
                                document.getElementById("player2timer").innerHTML = htmlseconds2;


                            }
                             if (game.turn() === 'w') {
                                htmlseconds2 = document.getElementById("player2timer").innerHTML;
                                splitseconds2 = htmlseconds2.split(':');                
                                //minutes are worth 60 seconds. 
                                fiveMinutes2 = ((+splitseconds2[0])*60) + (+splitseconds2[1]);

                                stopTimerforPlayer2();
                                startTimerforPlayer2(fiveMinutes2, display2);

                                //stop timer for opponent
                                htmlseconds1 = document.getElementById("player1timer").innerHTML;
                                stopTimerforPlayer1();
                                document.getElementById("player1timer").innerHTML = htmlseconds1;

                            }
                    }
        
        if (msg.playeremitted !== username) {
                if (serverGame && msg.gameId === serverGame.id) {
                   game.move(msg.move);
                   board.position(game.fen());
                }
            
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
            var t = "01:00";
            document.getElementById("player1timer").innerHTML = t;
            document.getElementById("player2timer").innerHTML = t;
        


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
            if (game.game_over() === true){
                stopTimerforPlayer1();
                stopTimerforPlayer2();
            } 
            else {
                            //timer
                    if (game.turn() === 'w') {

                        htmlseconds1 = document.getElementById("player1timer").innerHTML;
                        splitseconds1 = htmlseconds1.split(':');                
                        //minutes are worth 60 seconds. 
                        fiveMinutes1 = ((+splitseconds1[0])*60) + (+splitseconds1[1]);

                        stopTimerforPlayer1();
                        startTimerforPlayer1(fiveMinutes1, display1);

                        //stop timer for opponent
                        htmlseconds2 = document.getElementById("player2timer").innerHTML;
                        stopTimerforPlayer2();
                        document.getElementById("player2timer").innerHTML = htmlseconds2;


                    }
                     if (game.turn() === 'b') {
                        htmlseconds2 = document.getElementById("player2timer").innerHTML;
                        splitseconds2 = htmlseconds2.split(':');                
                        //minutes are worth 60 seconds. 
                        fiveMinutes2 = ((+splitseconds2[0])*60) + (+splitseconds2[1]);

                        stopTimerforPlayer2();
                        startTimerforPlayer2(fiveMinutes2, display2);

                        //stop timer for opponent
                        htmlseconds1 = document.getElementById("player1timer").innerHTML;
                        stopTimerforPlayer1();
                        document.getElementById("player1timer").innerHTML = htmlseconds1;

                    }
            }
            
           socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen(), playeremitted: username });
            


            
        }
      
      };
      
      // update the board position after the piece snap 
      // for castling, en passant, pawn promotion
      var onSnapEnd = function() {
        board.position(game.fen());
      };
    });
})();

