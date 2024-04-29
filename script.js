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

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

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
  };
}

function screenController() {
  const game = GameController();

  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

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
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    if (!selectedColumn || !selectedRow) return;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Initial render
  updateScreen();
}

screenController();
