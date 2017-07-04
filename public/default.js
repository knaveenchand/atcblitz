var htmlseconds1, htmlseconds2, splitseconds1, splitseconds2,
    htmlseconds_black, htmlseconds_white, splitseconds_black, splitseconds_white,
    server_sent_w_time, server_sent_b_time, server_sent_now_playing;

    var statusEl = $('#status');
    var toggleSound = document.getElementById("myaudio"); 

    var gamejuststarted;

    var whiteplayerid;
    var blackplayerid;
    
    var init_emitterid_w;
    var init_emitterid_b;

    var emitterid_w;
    var emitterid_b;

    var emitRecieverid;
    var newlyRecdEmitterId;
    var chesstimer = 60*1; // set the number of seconds here
    
    var fiveMinutes1 = chesstimer * 1;
    var fiveMinutes2 = chesstimer * 1;
    var t = "01:00";
    var initial_timer_for_white = chesstimer;
    var initial_interval_for_black = chesstimer*1000;
    var generic_interval = 1000;
    
    var display1 = document.querySelector('#player1timer');
    var display2 = document.querySelector('#player2timer');
    var setIntervalPlayer1, setIntervalPlayer2;
    
    var boardEl = $('#game-board');
    var squareClass = 'square-55d63';
    var squareToHighlight, colorToHighlight;


   /*
    function startTimerforPlayer1(duration, display, intvl) {
            var timer = duration, minutes, seconds;
            toggleSound.play();
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
                        $('#modalresult').html("Result: <strong>Black Wins</strong>. White flag down.")
                        console.log(modal);
                        modal.style.display = "block";
                            stopTimerforPlayer1();
                            stopTimerforPlayer2();

                }
            }, intvl);

        }

    function startTimerforPlayer2(duration, display, intvl) {
            var timer = duration, minutes, seconds;
            toggleSound.play();
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
                        $('#modalresult').html("Result: <strong>White Wins</strong>. Black flag down.")
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

*/

function sec_to_time(t) {
                
                if (t == 0) {
                    t=0
                }
                var minutes = parseInt(t / 60, 10);
                var seconds = parseInt(t % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                 return (minutes + ":" + seconds);
}

function splitseconds(timerdiv) {

    var htmlseconds = document.getElementById(timerdiv).innerHTML;
    var splitter = htmlseconds.split(':');
    var secs = ((+splitter[0])*60) + (+splitter[1]);
    return (secs);
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
                server_sent_now_playing = msg.now_playing;
                server_sent_gameover = msg.gameover;

        //move highlighting    
          if (msg.now_playing === 'b') {
            boardEl.find('.' + squareClass).removeClass('highlight-white');
            boardEl.find('.square-' + msg.move.from).addClass('highlight-white');
            squareToHighlight = msg.move.to;
            colorToHighlight = 'white';
          }
          else {
            boardEl.find('.square-55d63').removeClass('highlight-black');
            boardEl.find('.square-' + msg.move.from).addClass('highlight-black');
            squareToHighlight = msg.move.to;
            colorToHighlight = 'black';    
          }
    
                     updateStatus();    
                 
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
    socket.on('theplayers', function(plrs) {
        whiteplayerid = plrs.whiteplayerid;
        blackplayerid = plrs.blackplayerid;
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
            onSnapEnd: onSnapEnd,
            onChange: onChange,
            onMoveEnd: onMoveEnd
          };
          
               
          game = serverGame.board ? new Chess(serverGame.board) : new Chess();
          board = new ChessBoard('game-board', cfg);
          

            document.getElementById("new-w-timer").innerHTML = t;
            document.getElementById("new-b-timer").innerHTML = t;
            
            gamejuststarted = 1; //yes it jsut started
                    
            var whiteseconds_init = splitseconds("new-w-timer");
            var blackseconds_init = splitseconds("new-b-timer");
              
            //socket.emit('clear-timers', {clrw: serverGame.id+1, clrb: serverGame.id+2});
              
            init_emitterid_w = "atc-w"+serverGame.id+whiteseconds_init; 
            init_emitterid_b = "atc-b"+serverGame.id+whiteseconds_init; 
            
          
        if (username == whiteplayerid) {
                
            socket.emit('serverTimerEmitterId_w', {emitterid: init_emitterid_w, gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds_init, timer_black: blackseconds_init, now_playing: game.turn(), gameover: game.game_over(), gamestart: gamejuststarted });
            
            socket.on(init_emitterid_w, function(chkEmitId){
                if(chkEmitId.serverTimerEmitterId == init_emitterid_w) {
                    $('#new-w-timer').html(sec_to_time(chkEmitId.countdown_white));
                    $('#new-b-timer').html(sec_to_time(chkEmitId.countdown_black));                
                }
            if(splitseconds("new-w-timer") <= 0){
                socket.removeAllListeners(init_emitterid_w);
                var modal = document.getElementById('myModal');
                $('#modalresult').html("Result: <strong>Black Wins</strong>. White flag down.")
                modal.style.display = "block";               

            }
            });

          }
          
        if (username !== whiteplayerid) {
            socket.emit('serverTimerEmitterId_b', {emitterid: init_emitterid_b, gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds_init, timer_black: blackseconds_init, now_playing: game.turn(), gameover: game.game_over(), gamestart: gamejuststarted });
            
            socket.on(init_emitterid_b, function(chkEmitId){
                if(chkEmitId.serverTimerEmitterId == init_emitterid_b) {
                    $('#new-w-timer').html(sec_to_time(chkEmitId.countdown_white));
                    $('#new-b-timer').html(sec_to_time(chkEmitId.countdown_black));               
                }
            if(splitseconds("new-w-timer") <= 0){
                socket.removeAllListeners(init_emitterid_w);
                        var modal = document.getElementById('myModal');
                        $('#modalresult').html("Result: <strong>Black Wins</strong>. White flag down.")
                        modal.style.display = "block";               

                    }            

            }); 
        }

          updateStatus();

      }

    var onChange = function(oldPos, newPos) {
        
        if (username == whiteplayerid){
            //white player stuff
            // remove init listeners related to white player
            socket.removeAllListeners(init_emitterid_w);
            socket.removeAllListeners(emitterid_w);
            //console.log("emitterid_b at onchange: ",emitterid_w);
            
            var whiteseconds_w = splitseconds("new-w-timer");
            var blackseconds_w = splitseconds("new-b-timer");
            
            if (game.turn() == 'w') {
            emitterid_w = "atc-w"+serverGame.id+blackseconds_w+1;                
            }
            
            if ((game.turn() == 'b') || (gamejuststarted == 1)) {
            emitterid_w = "atc-w"+serverGame.id+whiteseconds_w+1;                
                
            }
             console.log("just before emit: ", emitterid_w);                    

            socket.emit('serverTimerEmitterId_w', {emitterid: emitterid_w, gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds_w, timer_black: blackseconds_w, now_playing: game.turn(), gameover: game.game_over(), gamestart: 0 });
            
            socket.on(emitterid_w, function(chkEmitId){
                if(chkEmitId.serverTimerEmitterId == emitterid_w) {
                    $('#new-w-timer').html(sec_to_time(chkEmitId.countdown_white));
                    $('#new-b-timer').html(sec_to_time(chkEmitId.countdown_black));                
                }
            if(splitseconds("new-w-timer") <= 0){
                socket.removeAllListeners(emitterid_w);
                var modal = document.getElementById('myModal');
                $('#modalresult').html("Result: <strong>Black Wins</strong>. White flag down.")
                modal.style.display = "block";               

            }
            if(splitseconds("new-b-timer") <= 0){
                socket.removeAllListeners(emitterid_w);
                var modal = document.getElementById('myModal');
                $('#modalresult').html("Result: <strong>White Wins</strong>. Black flag down.")
                modal.style.display = "block";               

            }
            }); 

            
        }
        
        if (username !== whiteplayerid){
            // black player stuff
            // remove init listeners related to black player
            socket.removeAllListeners(init_emitterid_b);
            socket.removeAllListeners(emitterid_b);
            //console.log("emitterid_b at onchange: ",emitterid_b);
            
            var whiteseconds_b = splitseconds("new-w-timer");
            var blackseconds_b = splitseconds("new-b-timer");

             if (game.turn() == 'w') {
            emitterid_b= "atc-b"+serverGame.id+blackseconds_b+1; 
            }
            
            if (game.turn() == 'b') {
            emitterid_b= "atc-b"+serverGame.id+whiteseconds_b+1; 
                
            }
            
            console.log("just before emit: ", emitterid_b);    
            socket.emit('serverTimerEmitterId_b', {emitterid: emitterid_b, gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds_b, timer_black: blackseconds_b, now_playing: game.turn(), gameover: game.game_over(), gamestart: 0 });

            socket.on(emitterid_b, function(chkEmitId){
                if(chkEmitId.serverTimerEmitterId == emitterid_b) {
                    $('#new-w-timer').html(sec_to_time(chkEmitId.countdown_white));
                    $('#new-b-timer').html(sec_to_time(chkEmitId.countdown_black));                
                }
            if(splitseconds("new-w-timer") <= 0){
                socket.removeAllListeners(emitterid_b);
                var modal = document.getElementById('myModal');
                $('#modalresult').html("Result: <strong>Black Wins</strong>. White flag down.")
                modal.style.display = "block";               

            }
            if(splitseconds("new-b-timer") <= 0){
                socket.removeAllListeners(emitterid_b);
                var modal = document.getElementById('myModal');
                $('#modalresult').html("Result: <strong>White Wins</strong>. Black flag down.")
                modal.style.display = "block";               

            }
            }); 

        }
          

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
            
            gamejuststarted = 0;
            
            var e_whiteseconds = splitseconds("new-w-timer");
            var e_blackseconds = splitseconds("new-b-timer");
            //console.log(username,whiteplayerid);
            
            /*
            if (username == whiteplayerid) {
                    if (game.turn() == 'b') {

                        socket.emit('client-timer', {gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds, timer_black: blackseconds, now_playing: 'b', gameover: game.game_over(), gamestart: 0 });
                    }

                    else {
                        socket.emit('client-timer', {gameId: serverGame.id, playeremitted: username, timer_white: whiteseconds, timer_black: blackseconds, now_playing: 'w', gameover: game.game_over(), gamestart: 0 });

                    }
            }
            */

            socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen(), playeremitted: username, timer_white: e_whiteseconds, timer_black: e_blackseconds, now_playing: game.turn(), gameover: game.game_over() });

                        
            updateStatus();
            
            
        }
          

      
      };
      
      // update the board position after the piece snap 
      // for castling, en passant, pawn promotion
      var onSnapEnd = function() {
        board.position(game.fen());
      };
        
        // status messages
        var updateStatus = function() {
                  var status = '';

                  var moveColor = 'White';
                    $('#player2').removeClass('activetimer');
                    $('#player1').addClass('activetimer');

                  if (game.turn() === 'b') {
                    moveColor = 'Black';
                    $('#player1').removeClass('activetimer');
                    $('#player2').addClass('activetimer');

                  }

                  // checkmate?
                  if (game.in_checkmate() === true) {
                    status = 'Game over, ' + moveColor + ' is in checkmate.';
                  }

                  // draw?
                  else if (game.in_draw() === true) {
                    status = 'Game over, drawn position';
                  }

                  // game still on
                  else {
                    status = moveColor + ' to move';

                    // check?
                    if (game.in_check() === true) {
                      status += ', ' + moveColor + ' is in check';
                    }
                  }
            
            statusEl.html(status);        
             toggleSound.play();
       
        };
        
        //for move highlighting 
        var onMoveEnd = function() {
          boardEl.find('.square-' + squareToHighlight)
            .addClass('highlight-' + colorToHighlight);
        };


 

        
    });
})();

