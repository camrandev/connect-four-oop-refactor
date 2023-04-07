"use strict";
//FIXME:ideally would show board as default, even before clicking start - can work on how to implement
//TODO:build HTML form + get user color input for the players

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
  const player1 = new Player('red')
  const player2 = new Player('blue')
  //create a new instance of Game with default args
  if (![...button.classList].includes("started")) {
    new Game(player1, player2, 6, 7);
    button.classList.add("started");
    button.innerText = "Restart";
  } else {
    const board = document.getElementById("board");
    board.innerHTML = "";
    new Game(player1, player2, 6, 7);
  }
}

//create a player class -> takes a color (from a webform)
//where is this called? probably within game
//need to create a web form

class Player{
  constructor(color){
    this.color = color;
  }
}


//my thinking is need to update game to take the player objects that will be created
//in start and restart game
class Game {
  constructor(p1, p2, width, height) {
    // initialize properties
    this.width = width;
    this.height = height;
    this.p1 = p1;
    this.p2 = p2;
    this.currPlayer = p1;
    this.board = [];

    // bind methods
    this.boundHandleClick = this.handleClick.bind(this);

    // create board model and render
    this.makeBoard();
    this.makeHtmlBoard(height, width);
  }

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard(height, width) {
    const htmlBoard = document.getElementById("board");

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", this.boundHandleClick);

    for (let x = 0; x < width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }

    htmlBoard.append(top);

    // make main part of board
    for (let y = 0; y < height; y++) {

      const row = document.createElement("tr");

      for (let x = 0; x < width; x++) {
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
  //TODO: refactor to pass in the current player to this function at calltime
  placeInTable(y, x) {
    console.log(this.currPlayer)
    const piece = document.createElement("div");
    const currPlayer = this.currPlayer
    piece.classList.add("piece");
    // piece.classList.add(`p${this.currPlayer}`);
    console.log(this.currPlayer)
    // piece.classList.add(`${this.currPlayer}`);
    // need to change this to hardcode the background
    piece.style.backgroundColor = `${currPlayer.color}`
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
//TODO: refactor to pass current player around
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
    console.log(this.currPlayer, this.p1, this.p2)
    this.currPlayer = currPlayer === this.p1 ? this.p2 : this.p1;
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
