function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
      //Cell {addToken, getValue} value === 0
    }
  }

  const getBoard = () => board;

  const signToken = (row, column, player) => {
    if (board[row][column].getValue() === 0) {
      board[row][column].addToken(player);
      return true;
    }
    return false;
  };

  // This method will be used to print our board to the console.
  // It is helpful to see what the board looks like after each turn as we play,
  // but we won't need it after we build our UI
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  // Here, we provide an interface for the rest of our
  // application to interact with the board
  return { getBoard, signToken, printBoard };
}

/*
 ** A Cell represents one "square" on the board and can have one of
 ** 0: no token is in the square,
 ** 1: Player One's token,
 ** 2: Player 2's token
 */

function Cell() {
  let value = 0;

  // Accept a player's token to change the value of the cell
  const addToken = (player) => {
    value = player;
  };

  // How we will retrieve the current value of this cell through closure
  const getValue = () => value;

  return {
    addToken,
    getValue,
  };
}

// winning logic
function WinningLogic(board, row, col) {
  let hasWon = false;
  const cellValueAt = (row, col) => {
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
      return null; //out of bounds
    }
    return board[row][col].getValue();
  };
  const winningCells = [[row, col]];
  const getWinningCells = () => winningCells;
  // function to check in both directions from a given start point
  const checkDirection = (dx, dy) => {
    let count = 1; //current cell is already included
    let r = row + dx;
    let c = col + dy;

    while (cellValueAt(r, c) === board[row][col].getValue()) {
      count++;
      winningCells.push([r, c]);
      r += dx;
      c += dy;
    }

    // check reverse direction from starting point
    r = row - dx;
    c = col - dy;
    while (cellValueAt(r, c) === board[row][col].getValue()) {
      count++;
      winningCells.push([r, c]);
      r -= dx;
      c -= dy;
    }
    return count;
  };
  const checkWin = () => {
    if (!hasWon) {
      if (checkDirection(1, 0) >= 3) {
        hasWon = true;
        return true;
      } //Vertical
      if (checkDirection(0, 1) >= 3) {
        hasWon = true;
        return true;
      } //Horizontal
      if (checkDirection(1, 1) >= 3) {
        hasWon = true;
        return true;
      } //Diagonal forward
      if (checkDirection(-1, 1) >= 3) {
        hasWon = true;
        return true;
      } //Diagonal backward
    }
    return false || hasWon;
  };
  return {
    checkWin,
    getWinningCells,
  };
}
// end of winning logic

/*
 ** The GameController will be responsible for controlling the
 ** flow and state of the game's turns, as well as whether
 ** anybody has won the game
 */
function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();
  // { getBoard, signToken, printBoard }

  const players = [
    {
      name: playerOneName,
      token: 1,
    },
    {
      name: playerTwoName,
      token: 2,
    },
  ];

  let activePlayer = players[0];
  let emptyCells = 9;
  let winningLogic;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const getEmptyCells = () => emptyCells;

  const getWinningLogic = () => winningLogic;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playRound = (row, column) => {
    // Sign a token for the current player
    if (board.signToken(row, column, getActivePlayer().token)) {
      console.log(
        `Signing ${
          getActivePlayer().name
        }'s token into row ${row}, column ${column}...`
      );
      /*  This is where we would check for a winner and handle that logic,
        such as a win message. */
      winningLogic = WinningLogic(board.getBoard(), row, column);
      if (emptyCells > 0) {
        emptyCells--;
      }
      if (winningLogic.checkWin()) {
        return console.log(`${getActivePlayer().name} won the game!`);
      }
      if (emptyCells <= 0) {
        return console.log(`it's a draw`);
      }

      // Switch player turn
      switchPlayerTurn();
    } else {
      console.log(
        `Failed to sign ${
          getActivePlayer().name
        }'s token into row ${row}, column ${column}, the cell is already signed.`
      );
    }
    printNewRound();
  };

  // Initial play game message
  printNewRound();

  // For the console version, we will only use playRound, but we will need
  // getActivePlayer for the UI version, so I'm revealing it now
  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getEmptyCells,
    getWinningLogic,
  };
}

function screenController(player1, player2) {
  let game = GameController(player1, player2);

  // dom elements
  const container = document.querySelector(".container");
  container.innerHTML = `<h1 class="turn"></h1>
  <div class="board"></div>`;
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";
    boardDiv.classList.remove("deactivated");

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    // Display player's turn
    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

    // Render board squares
    board.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = colIndex;
        cellButton.textContent =
          col.getValue() === 1 ? "X" : col.getValue() === 2 ? "Y" : "";
        boardDiv.appendChild(cellButton);
      });
    });
  };
  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedRow = +e.target.dataset.row;
    const selectedColumn = +e.target.dataset.column;

    game.playRound(selectedRow, selectedColumn);
    const winningLogic = game.getWinningLogic();

    const addRetryBtn = () => {
      // add retry button
      const retryBtn = document.createElement("button");
      retryBtn.textContent = "Retry";
      retryBtn.type = "button";
      retryBtn.onclick = gameMenu;
      retryBtn.classList.add("retry-button"); // Adding a class

      container.appendChild(retryBtn);
    };
    if (winningLogic.checkWin()) {
      updateScreen();
      const winningCells = winningLogic.getWinningCells();
      let allCellsDOM = Array.from(document.querySelectorAll(".cell"));

      const winningCellsDOM = allCellsDOM.filter((cellDOM) => {
        const row = +cellDOM.dataset.row;
        const col = +cellDOM.dataset.column;

        for (let [r, c] of winningCells) {
          if (row === r && col === c) {
            return true;
          }
        }
        return false;
      });

      // do something with winning cells style
      boardDiv.removeEventListener("click", clickHandlerBoard);
      boardDiv.classList.add("deactivated");
      playerTurnDiv.textContent = `${
        game.getActivePlayer().name
      } Won The game!`;
      console.log(winningCellsDOM);
      winningCellsDOM.forEach((cellDOM) => {
        cellDOM.style.color = "#aa5555";
      });
      // add strike trhough line logic
      const lineCoords = winningCellsDOM
        .filter((el, i) => {
          return i !== 1;
        })
        .reduce((acc, el, i) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          acc[`x${i + 1}`] = centerX;
          acc[`y${i + 1}`] = centerY;
          return acc;
        }, {});
      // const line = createLine(lineCoords);
      // container.appendChild(line);

      addRetryBtn();

      return;
    }
    console.log(game.getEmptyCells());
    if (game.getEmptyCells() <= 0) {
      updateScreen();
      addRetryBtn();
      return (playerTurnDiv.textContent = "This is a Draw!");
    }
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Initial render
  updateScreen();
}

function gameMenu() {
  const container = document.querySelector(".container");

  container.innerHTML = `<h1>Welcome to Tic Tac Toe</h1>
  <form id="playerForm">
    <label for="player1">Player 1 Name:</label>
    <input
      type="text"
      id="player1"
      placeholder="Player 1"
    />
    <br />
    <label for="player2">Player2 Name:</label>
    <input
      type="text"
      id="player2"
      placeholder="Player 2"
    />
    <br />
    <button type="submit">Start Game</button>
  </form>`;
  const startForm = document.querySelector("#playerForm");
  startForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const player1 = container.querySelector("#player1").value.trim();
    const player2 = container.querySelector("#player2").value.trim();
    screenController(player1 || "Player One", player2 || "Player Two");
  });
}

gameMenu();

// helper function
function createLine({ x2, y2, x1, y1 }) {
  const line = document.createElement("div");
  line.classList.add("line");

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  line.style.width = length + "px";
  line.style.height = "2px";
  line.style.backgroundColor = "black";
  line.style.position = "absolute";
  line.style.left = x1 + "px";
  line.style.top = y1 + "px";
  line.style.transformOrigin = "0 0";
  line.style.stransform = "rotate(${angle}deg)";

  return line;
}
