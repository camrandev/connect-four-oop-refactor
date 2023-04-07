"use strict";
/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

/** create the 'start" button and add it to the UI */
function makeHtmlButton() {
  const gameBoard = document.getElementById("game");
  const startButton = document.createElement("button");

  startButton.innerText = "Start";
  //attach event listener, passing in new Game as the callback
  startButton.addEventListener("click", startAndRestartGame);

  gameBoard.append(startButton);
}

/** starts a new game, handles cases of active game and game over */
function startAndRestartGame(evt) {
  const button = evt.target;
  //create a new instance of Game with default args
  if (![...button.classList].includes("started")) {
    new Game(6, 7);
    button.classList.add("started");
    button.innerText = "Restart";
  } else {
    const board = document.getElementById("board");
    board.innerHTML = "";
    new Game(6, 7);
  }
}

class Game {
  constructor(width, height) {
    // initialize properties
    this.width = width;
    this.height = height;
    this.currPlayer = 1;
    this.board = [];

    // bind methods
    this.boundHandleClick = this.handleClick.bind(this);

    // create board model and render
    this.makeBoard();
    this.makeHtmlBoard();
  }

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const htmlBoard = document.getElementById("board");

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", this.boundHandleClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }

    htmlBoard.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `c-${y}-${x}`);
        row.append(cell);
      }

      htmlBoard.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */
  placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.classList.add(`p${this.currPlayer}`);
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`c-${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */
  endGame(msg) {
    alert(msg);
    // freeze game
    const topRow = document.getElementById("column-top");
    console.log("topRow=", topRow);
    topRow.removeEventListener("click", this.boundHandleClick);
  }

/** handleClick: handle click of column top to play piece */
  handleClick(evt) {
    // grab instance properties
    let board = this.board;
    let currPlayer = this.currPlayer;

    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    board[y][x] = currPlayer;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${currPlayer} won!
      Please click Restart to play another game!`);
    }

    // check for tie
    if (board.every((row) => row.every((cell) => cell))) {
      return this.endGame("Tie! Please click Restart to play another game!");
    }

    // switch players
    this.currPlayer = currPlayer === 1 ? 2 : 1;
  }

/** checkForWin: check board cell-by-cell for "does a win start here?" */
  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}

makeHtmlButton();
